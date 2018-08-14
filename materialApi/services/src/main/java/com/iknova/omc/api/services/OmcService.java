package com.iknova.omc.api.services;

import java.io.IOException;
import java.nio.file.Path;

import com.google.gson.JsonObject;

/**
 * Service de gestion de la base de données matériaux du POC OMC.
 *
 * @author Pierre-Louis JAEGER (<a href="mailto:pjr@iknova.com">pjr@iknova.com</a>)
 * @since v1.0
 */
public interface OmcService
{
    /**
     * Déploie l'AMI spécifiée sur Kvoweb.
     *
     * @param amiPath
     *            chemin vers le ZIP de l'AMI à déployer
     */
    void deployKvowebAmi(Path amiPath);

    /**
     * Génère la BDD matériaux à partir d'un fichier CSV.
     *
     * @param csv
     *            fichier CSV à traiter
     * @return la BDD correspondante
     */
    JsonObject generateMaterialDb(String csv);

    /**
     * Génère l'AMI Kvoweb à partir de la BDD matériaux.
     *
     * @param materialDb
     *            BDD matériaux
     * @return le chemin vers le ZIP de l'AMI générée
     * @throws IOException
     *             en cas d'erreur d'IO lors de la génération des fichiers KDL
     */
    Path generateOmcAmi(JsonObject materialDb) throws IOException;

    /**
     * Récupère la base de données matériaux stockée sur le serveur.
     *
     * @return la base de données matériaux
     * @throws IOException
     *             en cas d'erreur lors de la lecture du fichier de BDD depuis le disque
     */
    JsonObject getMaterialDb() throws IOException;

    /**
     * Sauve la base de données matériaux spécifiée sur le serveur.
     *
     * @param materialDb
     *            BDD à sauver
     * @throws IOException
     *             en cas d'erreur lors de la sauvegarde du fichier sur le disque
     */
    void saveMaterialDb(JsonObject materialDb) throws IOException;
}
