package com.iknova.omc.api.internal.services;

import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.file.FileVisitResult;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.SimpleFileVisitor;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.ArrayList;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.iknova.omc.api.services.OmcService;

public class OmcServiceImpl implements OmcService
{
    private static final Logger LOG = LoggerFactory.getLogger(OmcServiceImpl.class);

    private static final Gson GSON = new Gson();

    private final Path materialDbFile;

    private JsonObject materialDb;

    public OmcServiceImpl() throws IOException
    {
        materialDbFile = Files.createTempFile("omc_material_db",".json");
    }

    private static void zipFolder(Path sourceFolderPath, Path zipPath) throws IOException
    {
        try (ZipOutputStream zos = new ZipOutputStream(Files.newOutputStream(zipPath)))
        {
            Files.walkFileTree(sourceFolderPath,new SimpleFileVisitor<Path>()
            {
                @Override
                public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException
                {
                    zos.putNextEntry(new ZipEntry(sourceFolderPath.relativize(file).toString()));
                    Files.copy(file,zos);
                    zos.closeEntry();
                    return FileVisitResult.CONTINUE;
                }
            });
        }
    }

    @Override
    public void deployKvowebAmi(Path amiPath)
    {
        // TODO Méthode de test débile

        LOG.debug("Deploying Kvoweb AMI");

    }

    @Override
    public JsonObject generateMaterialDb(String csv)
    {
        // TODO Méthode de test débile

        LOG.debug("Generating material Db");

        JsonObject materialDb = new JsonObject();

        materialDb.addProperty("Hello","World");

        return materialDb;
    }

    @Override
    public Path generateOmcAmi(JsonObject materialDb) throws IOException
    {
        // TODO Méthode de test débile

        LOG.debug("Generating Kvoweb AMI");

        Path workingDir = Files.createTempDirectory("omc_working_dir");

        Path amiDir = workingDir.resolve("omc");
        Files.createDirectory(amiDir);

        Path amiFile = amiDir.resolve("ami.kva");

        List<String> lines = new ArrayList<>();
        lines.add("Hello AMI");
        lines.add("from Brignais");
        lines.add(materialDb.toString());

        Files.write(amiFile,lines,Charset.defaultCharset());

        Path zipFile = workingDir.resolve("ami.zip");
        zipFolder(amiDir,zipFile);
        LOG.debug("AMI zip file: {}",zipFile);
        return zipFile;
    }

    @Override
    public JsonObject getMaterialDb() throws IOException
    {
        if (materialDb == null)
        {
            String json = new String(Files.readAllBytes(materialDbFile),Charset.forName("utf-8"));
            materialDb = GSON.fromJson(json,JsonObject.class);
            LOG.debug("Material DB retrieved from {}",materialDbFile);
        }
        return materialDb;
    }

    @Override
    public void saveMaterialDb(JsonObject materialDb) throws IOException
    {
        this.materialDb = materialDb;

        byte[] json = GSON.toJson(materialDb).getBytes(Charset.forName("utf-8"));

        Files.write(materialDbFile,json);

        LOG.debug("Material DB saved to {}",materialDbFile);
    }
}
