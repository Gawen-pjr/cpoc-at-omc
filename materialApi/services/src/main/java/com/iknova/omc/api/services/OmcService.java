package com.iknova.omc.api.services;

import java.io.IOException;

import com.google.gson.JsonObject;

/**
 * Service de gestion des bases de données matériaux du POC AT-OMC.
 *
 * @author Pierre-Louis JAEGER (<a href="mailto:pjr@iknova.com">pjr@iknova.com</a>)
 * @since v1.0
 */
public interface OmcService
{
    /**
     * Génère la BDD matériaux à partir d'un fichier CSV.
     *
     * @param csv
     *            fichier CSV à traiter
     * @return la BDD correspondante
     */
    JsonObject generateMaterialDb(String csv);

    /**
     * Récupère la base de données matériaux spécifiée stockée sur le serveur.
     *
     * @param dbName
     *            nom de la base de donnée recherchée
     * @return la base de données matériaux correspondante
     * @throws IllegalStateException
     *             en cas d'erreur lors de la lecture du fichier de BDD depuis le disque
     */
    JsonObject getMaterialDb(String dbName);

    /**
     * Sauve la base de données matériaux spécifiée sur le serveur.
     *
     * @param dbName
     *            nom de la base de données
     * @param materialDb
     *            BDD à sauver
     * @throws IOException
     *             en cas d'erreur lors de la sauvegarde du fichier sur le disque
     */
    void saveMaterialDb(String dbName, JsonObject materialDb) throws IOException;
}
