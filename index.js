/**
 * @file Main program to generate release notes based on Jira versions in confluence
 */

require("dotenv").config();
const atlassian = require("./src/atlassian");
const releaseNotes = require("./src/releaseNotes");
const logger = require("./src/logger");
const ConfigProvider = require("./src/configProvider");
const config = require("./config.json");

/** @const DEBUG global debug on (print full errors including stack trace to console) */
const DEBUG = true;

(async function main() {
    try {
        // Validate and load configuration
        const configProvider = new ConfigProvider(config);
        if (!configProvider.validate()) return;

        // Get the space id
        const spaceName = configProvider.getSpace();
        const spaceId = await atlassian.getSpaceId(spaceName);
        if (!spaceId) {
            throw new Error(`The space "${spaceName}" does not exist.`);
        }
        logger.info(`Found space "${spaceName}" (id: ${spaceId}).`);

        // Get the parent page id
        const parentPage = configProvider.getParentPage();
        const parentPageId = await atlassian.getPageIdByName(parentPage);
        if (!parentPageId) {
            throw new Error(`The parent page "${parentPage}" does not exist.`);
        }
        logger.info(`Found parent page "${parentPage}" (id: ${parentPageId}).`);

        // Check if release notes already exist
        const pageName = configProvider.getPageName();
        const fixVersion = configProvider.getFixVersion();
        const doReleaseNotesExist = await atlassian.getPageIdByName(pageName);
        if (doReleaseNotesExist) {
            throw new Error(
                `The release notes for verion ${fixVersion} already exist.`
            );
        }

        // Load all issues of the version from Jira
        const projects = configProvider.getProjectKeys();
        const versionIssues = await atlassian.getIssuesForVersion(
            fixVersion,
            projects
        );

        // Build the release notes
        const pageProperites = configProvider.getPageProperties();
        const sections = configProvider.getSections();
        const fallbackEmoji = configProvider.getFallbackEmoji();
        const pageContent = releaseNotes.createReleaseNotes(
            pageProperites,
            sections,
            versionIssues,
            fallbackEmoji
        );

        // Create the new page in Confluence
        const newPage = await atlassian.createPage(
            spaceId,
            parentPageId,
            pageName,
            pageContent
        );

        logger.info(
            `Created release notes for version ${fixVersion} at ${newPage}`
        );
    } catch (err) {
        if (err.name === "AxiosError") {
            logger.error(
                "Jira REST API Error: " + JSON.stringify(err.response.data)
            );
        } else {
            logger.error(err.message);
        }
        if (DEBUG) console.log(err);
    }
})();
