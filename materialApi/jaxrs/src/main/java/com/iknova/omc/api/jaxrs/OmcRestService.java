package com.iknova.omc.api.jaxrs;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.util.Scanner;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.apache.cxf.jaxrs.ext.multipart.Attachment;
import org.apache.cxf.jaxrs.ext.multipart.Multipart;
import org.apache.cxf.rs.security.cors.CrossOriginResourceSharing;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonObject;
import com.iknova.omc.api.services.OmcService;

/**
 * End-Point API REST OMC.
 *
 * @author Pierre-Louis JAEGER (<a href="mailto:pjr@iknova.com">pjr@iknova.com</a>)
 * @since v1.0
 */
@CrossOriginResourceSharing(allowAllOrigins = true)
public class OmcRestService
{
    private static final Logger LOG  = LoggerFactory.getLogger(OmcRestService.class);
    private static final Gson   GSON = new GsonBuilder().setPrettyPrinting().create();

    private OmcService omcService;

    @GET
    @Path("/about")
    @Produces("text/plain")
    public Response about()
    {
        return Response.ok().entity("OMC REST API").build();
    }

    @GET
    @Path("/material-db/{dbName}")
    @Produces("application/json")
    public Response getMaterialDb(@PathParam("dbName") String dbName) throws IOException
    {
        LOG.debug("getMaterialDb");
        JsonObject materialDb = omcService.getMaterialDb(dbName);
        return Response.ok().type("application/json").entity(GSON.toJson(materialDb)).build();
    }

    @POST
    @Path("/material-db/{dbName}/csv")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    public Response parseCsv(@PathParam("dbName") String dbName, @Multipart("csvFile") Attachment csvFile)
        throws IOException
    {
        try (InputStream in = csvFile.getObject(InputStream.class))
        {
            @SuppressWarnings("resource")
            Scanner s = new Scanner(in,"utf-8").useDelimiter("\\A");
            return parseCsv(dbName,s.hasNext() ? s.next() : "");
        }
    }

    @POST
    @Path("/material-db/{dbName}/csv")
    public Response parseCsv(@PathParam("dbName") String dbName, String csvContent) throws IOException
    {
        String summary = csvContent;
        if (summary.length() > 100)
        {
            summary = summary.substring(0,100);
        }
        LOG.debug("parseCsv \n{}\n...",summary);

        JsonObject materialDb = omcService.generateMaterialDb(csvContent);
        omcService.saveMaterialDb(dbName,materialDb);

        return Response.created(URI.create("/material-db/" + dbName)).build();
    }

    /**
     * Injecte le service {@link OmcService}.
     *
     * @param omcService
     *            service à injecter
     */
    public void setOmcService(OmcService omcService)
    {
        this.omcService = omcService;
    }
}
