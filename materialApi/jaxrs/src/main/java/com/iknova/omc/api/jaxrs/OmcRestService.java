package com.iknova.omc.api.jaxrs;

import java.io.IOException;

import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Response;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.gson.JsonObject;
import com.iknova.omc.api.services.OmcService;

/**
 * End-Point API REST OMC.
 *
 * @author Pierre-Louis JAEGER (<a href="mailto:pjr@iknova.com">pjr@iknova.com</a>)
 * @since v1.0
 */
public class OmcRestService
{
    private static final Logger LOG = LoggerFactory.getLogger(OmcRestService.class);

    private OmcService omcService;

    @GET
    @Path("/material-db")
    @Produces("application/json")
    public Response getMaterialDb() throws IOException
    {
        LOG.debug("getMaterialDb");
        JsonObject materialDb = omcService.getMaterialDb();
        return Response.ok().type("application/json").entity(materialDb).build();
    }

    @POST
    @Path("/material-db/csv")
    public Response parseCsv(String csvContent) throws IOException
    {
        String summary = csvContent;
        if (summary.length() > 100)
        {
            summary = summary.substring(0,100);
        }
        LOG.debug("parseCsv \n{}\n...",summary);

        JsonObject materialDb = omcService.generateMaterialDb(csvContent);
        omcService.saveMaterialDb(materialDb);

        java.nio.file.Path amiPath = omcService.generateOmcAmi(materialDb);
        omcService.deployKvowebAmi(amiPath);

        return Response.ok().build();
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
