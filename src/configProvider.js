"use strict"
/**
 * @module configProvider Provides APIs to validate and get configuration
 */

const Joi = require("joi");
const logger = require("./logger");

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

class ConfigProvider {
    #config = {};
    constructor(config) {
        if (ConfigProvider.instance) {
            return ConfigProvider.instance;
        }
        ConfigProvider.instance = this;

        this.#config = config;
        return this;
    }

    /**
     * Validate the JSON configuration
     * @public
     */
    validate() {
        if ((Object.keys(this.#config).length = 0)) return false;
        const { error } = CONFIG_SCHEMA.validate(this.#config, { abortEarly: false });
        if (error) {
            error.details.forEach((detail) => {
                logger.error(
                    `Configuration error: ${detail.message
                    }. Path: ${JSON.stringify(detail.path)}`
                );
            });
            return false;
        }
        return true;
    }

    /**
     * Get the fix version
     * @public
     * @returns {string} fix version
     */
    getFixVersion() {
        return this.#config.fixVersion;
    }

    /**
     * Get the page properties
     * @public
     * @returns {Array} Page properties
     */
    getPageProperties() {
        return [
            { name: "Fix Version", value: this.#config.fixVersion },
            ...this.#config.releaseMetaInformation,
            ...this.#config.content.additionalPageProperties,
        ];
    }

    /**
     * Get the sections for the release notes
     * @public
     * @returns {Array} Sections
     */
    getSections() {
        return this.#config.content.sections;
    }

    /**
     * Get the Jira field that contains the release notes
     * @public
     * @returns {string} Jira release notes field
     */
    getReleaseNotesField() {
        return this.#config.releaseNotesField;
    }

    /**
     * Get the fallback emoji
     * @public
     * @returns {string} fallback emoji
     */
    getFallbackEmoji() {
        return this.#config.fallBackTitleEmoji;
    }

    /**
     * Get the missing release notes text
     * @public
     * @returns {string} The text for missing release notes
     */
    getMissingReleaseNotesText() {
        return this.#config.missingReleaseNotesText;
    }

    /**
     * Get the name for the release notes page
     * @public
     * @returns {string} The name for the release notes page
     */
    getPageName() {
        return `Release notes ${this.#config.fixVersion}_test`;
    }

    /**
     * Get the parent page for the release notes
     * @public
     * @returns {string} The parent page for the release notes
     */
    getParentPage() {
        return this.#config.parentPage;
    }

    /**
     * Get the space name in which to create the release notes
     * @public
     * @returns {string} The space name
     */
    getSpace() {
        return this.#config.space;
    }

    /**
     * Get the projects (keys) to look for issues in a release
     * @public
     * @returns {Array} Project keys
     */
    getProjectKeys() {
        return this.#config.projects;
    }
}

module.exports = ConfigProvider;
