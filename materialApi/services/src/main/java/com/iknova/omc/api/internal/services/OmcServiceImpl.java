package com.iknova.omc.api.internal.services;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.Normalizer;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Map.Entry;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Function;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonPrimitive;
import com.iknova.omc.api.services.OmcService;

public class OmcServiceImpl implements OmcService
{
    private static class Mapping
    {
        private final String                          jsonKey;
        private final Function<String, JsonPrimitive> propertyParser;

        Mapping(String jsonKey, Function<String, JsonPrimitive> propertyParser)
        {
            this.jsonKey = jsonKey;
            this.propertyParser = propertyParser;
        }

        void setProperty(JsonObject json, String value)
        {
            JsonPrimitive jsonVal = propertyParser.apply(value);
            if (jsonVal != null)
            {
                json.add(jsonKey,jsonVal);
            }
        }
    }

    private static final Logger LOG = LoggerFactory.getLogger(OmcServiceImpl.class);

    private static final Gson    GSON  = new Gson();
    private static final Charset UTF_8 = Charset.forName("utf-8");

    private static final Map<Integer, Mapping> CSV2JSON_MAPPINGS;

    static
    {
        try (InputStream in = OmcServiceImpl.class.getResourceAsStream("/csv2jsonMapping.json"))
        {
            JsonObject csv2jsonMappings = GSON.fromJson(new InputStreamReader(in,UTF_8),JsonObject.class);
            Map<Integer, Mapping> mappings = new HashMap<>();

            for (Entry<String, JsonElement> mapping : csv2jsonMappings.entrySet())
            {
                int col = Integer.parseInt(mapping.getKey());
                JsonArray val = mapping.getValue().getAsJsonArray();
                String key = val.get(0).getAsString();
                String type = val.get(1).getAsString();

                Function<String, JsonPrimitive> valueParser;
                switch (type)
                {
                case "string":
                    valueParser = JsonPrimitive::new;
                    break;
                case "nullableFloat":
                    valueParser = OmcServiceImpl::parseNullableFloat;
                    break;
                case "float":
                    valueParser = OmcServiceImpl::parseFloat;
                    break;
                case "nullableInteger":
                    valueParser = OmcServiceImpl::parseNullableInteger;
                    break;
                case "integer":
                    valueParser = OmcServiceImpl::parseInteger;
                    break;
                default:
                    throw new IllegalStateException("Unknown value type " + type);
                }

                mappings.put(col,new Mapping(key,valueParser));
            }

            CSV2JSON_MAPPINGS = Collections.unmodifiableMap(mappings);
        }
        catch (IOException e)
        {
            throw new RuntimeException(e);
        }
    }

    private final Map<String, JsonObject> materialDbCache = new ConcurrentHashMap<>();

    private Path dbDirectory;

    private static String normalizeToJsonKey(String s)
    {
        return stripAccents(s).trim().replace(' ','_').replaceAll("[^a-zA-Z_]","").toLowerCase();
    }

    private static JsonPrimitive parseFloat(String value)
    {
        return new JsonPrimitive(Float.parseFloat(value.replace(',','.')));
    }

    private static JsonPrimitive parseInteger(String value)
    {
        return new JsonPrimitive(Integer.parseInt(value));
    }

    private static JsonPrimitive parseNullableFloat(String value)
    {
        String filteredValue = value.trim().toLowerCase();
        if (filteredValue.equals("-") || filteredValue.equals("n/a"))
        {
            return null;
        }
        return parseFloat(value);
    }

    private static JsonPrimitive parseNullableInteger(String value)
    {
        String filteredValue = value.trim().toLowerCase();
        if (filteredValue.equals("-") || filteredValue.equals("n/a"))
        {
            return null;
        }
        return parseInteger(value);
    }

    public static String stripAccents(String s)
    {
        String result = Normalizer.normalize(s,Normalizer.Form.NFD);
        result = result.replaceAll("[\\p{InCombiningDiacriticalMarks}]","");
        return result;
    }

    @Override
    public JsonObject generateMaterialDb(String csv)
    {
        LOG.debug("Generating material Db");

        InputStream skeleton = OmcServiceImpl.class.getResourceAsStream("/materialsSkeleton.json");
        JsonObject materialDb = GSON.fromJson(new InputStreamReader(skeleton,UTF_8),JsonObject.class);
        JsonObject families = materialDb.getAsJsonObject("families");
        JsonObject grades = materialDb.getAsJsonObject("grades");

        String[] lines = csv.replaceAll("(\r|\n|\r\n)+","\n").split("\n");

        String curFamilyKey = null;

        for (int i = 1; i < lines.length; i++)
        {
            String line = lines[i];
            String[] cells = line.split(";");

            if (cells.length == 0)
            {
                continue;
            }

            String family = cells[0].trim();
            if (!family.isEmpty())
            {
                curFamilyKey = normalizeToJsonKey(family);

                JsonObject newFamily = new JsonObject();
                newFamily.addProperty("id",curFamilyKey);
                newFamily.addProperty("name",family);

                families.add(curFamilyKey,newFamily);
            }

            if (curFamilyKey == null)
            {
                throw new IllegalStateException("No family defined for material " + line);
            }

            JsonObject grade = new JsonObject();
            String gradeName = cells[1].trim();
            String gradeKey = normalizeToJsonKey(gradeName);
            grades.add(gradeKey,grade);

            grade.addProperty("id",gradeKey);
            grade.addProperty("name",gradeName);
            grade.addProperty("family",curFamilyKey);

            JsonObject characteristics = new JsonObject();
            grade.add("characteristics",characteristics);

            for (int j = 2; j < cells.length; j++)
            {
                Mapping mapping = CSV2JSON_MAPPINGS.get(j);
                if (mapping != null)
                {
                    mapping.setProperty(characteristics,cells[j]);
                }
            }
        }

        return materialDb;
    }

    @Override
    public JsonObject getMaterialDb(String dbName)
    {
        return materialDbCache.computeIfAbsent(dbName,dbn -> {
            Path dbFile = dbDirectory.resolve(dbn + ".json");

            if (!Files.exists(dbFile))
            {
                throw new IllegalArgumentException("No material DB with name " + dbn);
            }

            try
            {
                String json = new String(Files.readAllBytes(dbFile),Charset.forName("utf-8"));
                LOG.debug("Material DB retrieved from {}",dbFile);
                return GSON.fromJson(json,JsonObject.class);
            }
            catch (IOException e)
            {
                throw new IllegalStateException(e);
            }
        });
    }

    @Override
    public void saveMaterialDb(String dbName, JsonObject materialDb) throws IOException
    {
        materialDbCache.put(dbName,materialDb);

        byte[] json = GSON.toJson(materialDb).getBytes(Charset.forName("utf-8"));
        Path dbFile = dbDirectory.resolve(dbName + ".json");

        Files.write(dbFile,json);

        LOG.debug("Material DB saved to {}",dbFile);
    }

    /**
     * Injecte le chemin de sauvegarde des bases de données matériaux.
     *
     * @param dbDirectory
     *            chemin des BDD
     */
    public void setDbDirectory(String dbDirectory)
    {
        this.dbDirectory = Paths.get(dbDirectory);
    }
}
