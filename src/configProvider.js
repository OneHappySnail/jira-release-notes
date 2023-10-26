/**
 * @module configProvider Provides APIs to validate and get configuration
 */

const Joi = require("joi");
const logger = require("./logger");
const CONFIG = require("../config.json");

/** @constant CONFIG_SCHEMA Validation schema for the JSON configuration */
const CONFIG_SCHEMA = Joi.object({
    fixVersion: Joi.string().required(),
    releaseMetaInformation: Joi.array().items(
        Joi.object({
            name: Joi.string().required(),
            value: Joi.string().required(),
        })
    ),
    projects: Joi.array().min(1).items(Joi.string()),
    space: Joi.string().required(),
    parentPage: Joi.string().required(),
    fallBackTitleEmoji: Joi.string().required(),
    releaseNotesField: Joi.string().required(),
    missingReleaseNotesText: Joi.string().required(),
    content: Joi.object({
        additionalPageProperties: Joi.array().items(
            Joi.object({
                name: Joi.string().required(),
                value: Joi.string().required(),
            })
        ),
        sections: Joi.array()
            .min(1)
            .items(
                Joi.object({
                    emoji: Joi.string().required(),
                    title: Joi.string().required(),
                    subTitle: Joi.string().required(),
                    includeIssueTypes: Joi.array().min(1).items(Joi.string()),
                })
            )
            .required(),
    }),
});

/**
 * Validate the JSON configuration
 */
function validate() {
    const { error } = CONFIG_SCHEMA.validate(CONFIG, { abortEarly: false });
    if (error) {
        error.details.forEach((detail) => {
            logger.error(
                `Configuration error: ${detail.message}. Path: ${JSON.stringify(
                    detail.path
                )}`
            );
        });
        return false;
    }
    return true;
}

/**
 * Get the fix version
 * @returns {string} fix version
 */
function getFixVersion() {
    return CONFIG.fixVersion;
}

/**
 * Get the page properties
 * @returns {Array} Page properties
 */
function getPageProperties() {
    return [
        { name: "Fix Version", value: CONFIG.fixVersion },
        ...CONFIG.releaseMetaInformation,
        ...CONFIG.content.additionalPageProperties,
    ];
}

/**
 * Get the sections for the release notes
 * @returns {Array} Sections
 */
function getSections() {
    return CONFIG.content.sections;
}

/**
 * Get the Jira field that contains the release notes
 * @returns {string} Jira release notes field
 */
function getReleaseNotesField() {
    return CONFIG.releaseNotesField;
}

/**
 * Get the fallback emoji
 * @returns {string} fallback emoji
 */
function getFallbackEmoji() {
    return CONFIG.fallBackTitleEmoji;
}

/**
 * Get the missing release notes text
 * @returns {string} The text for missing release notes
 */
function getMissingReleaseNotesText() {
    return CONFIG.missingReleaseNotesText;
}

/**
 * Get the name for the release notes page
 * @returns {string} The name for the release notes page
 */
function getPageName() {
    return `Release notes ${CONFIG.fixVersion}_test`;
}

/**
 * Get the parent page for the release notes
 * @returns {string} The parent page for the release notes
 */
function getParentPage() {
    return CONFIG.parentPage;
}

/**
 * Get the space name in which to create the release notes
 * @returns {string} The space name
 */
function getSpace() {
    return CONFIG.space;
}

/**
 * Get the projects (keys) to look for issues in a release
 * @returns {Array} Project keys
 */
function getProjectKeys() {
    return CONFIG.projects;
}

module.exports = {
    validate,
    getFixVersion,
    getPageProperties,
    getSections,
    getReleaseNotesField,
    getFallbackEmoji,
    getMissingReleaseNotesText,
    getPageName,
    getParentPage,
    getSpace,
    getProjectKeys,
};
