/**
 * @module atlassian Provides APIs to interact with Jira and Confluence REST APIs
 */

const axios = require("axios");
const ConfigProvider = require("./configProvider.js");

/** @constant API_TOKEN Jira API token */
const API_TOKEN = process.env.JIRA_API_TOKEN;

/** @constant EMAIL_ADDRESS Email address of Jira user */
const EMAIL_ADDRESS = process.env.JIRA_EMAIL;

/** @constant JIRA_BASE_URL Jira base URL */
const JIRA_BASE_URL = process.env.JIRA_BASE_URL;

/** @constant AUTH_HEADERS Authorization headers for Jira and Confluence REST API */
const AUTH_HEADERS = {
    Authorization: `Basic ${Buffer.from(
        EMAIL_ADDRESS + ":" + API_TOKEN
    ).toString("base64")}`,
    Accept: "application/json",
};

/**
 * Crate a new page in Confluence
 * @param {string} spaceId Id of target space
 * @param {string} parentPageId Id of the parent page
 * @param {string} pageName Title of the page
 * @param {string} content Page content in "storage" representation
 * @returns {string} Resolves with a link to the new page
 */
async function createPage(spaceId, parentPageId, pageName, content) {
    const pageBody = {
        spaceId: spaceId,
        parentId: parentPageId,
        status: "current",
        title: pageName,
        body: {
            representation: "storage",
            value: content,
        },
    };

    const response = await axios({
        method: "post",
        baseURL: JIRA_BASE_URL,
        url: "/wiki/api/v2/pages",
        data: pageBody,
        headers: AUTH_HEADERS,
    });

    return process.env.JIRA_BASE_URL + "/wiki" + response.data["_links"].webui;
}

/**
 * Get the id of a page by it's title
 * @param {string} pageName Name of the page to get the Id from
 * @returns {string} Resolves with the page id or an empty string if it does not exist
 */
async function getPageIdByName(pageName) {
    const response = await axios({
        method: "get",
        baseURL: JIRA_BASE_URL,
        url: "/wiki/api/v2/pages",
        headers: AUTH_HEADERS,
        params: {
            title: pageName,
        },
    });

    return response.data.results.length > 0 ? response.data.results[0].id : "";
}

/**
 * Get the id of a confluence space by it's name
 * @param {string} spaceName Name of the space
 * @returns {string} Resolves with the space id or an empty string if it does not exist
 */
async function getSpaceId(spaceName) {
    const response = await axios({
        method: "get",
        baseURL: JIRA_BASE_URL,
        url: "/wiki/api/v2/spaces",
        headers: AUTH_HEADERS,
    });
    if (response.data.results.length > 0) {
        const targetSpace = response.data.results.filter(
            (space) => space.name === spaceName
        );
        return targetSpace[0].id;
    }
    return "";
}

/**
 * Get all issues for a fix version
 * @param {string} fixVersion Jira Release
 * @param {Array<string>} projects Project keys
 * @returns {Array} Resolves the Jira issues for the specified fix version
 */
async function getIssuesForVersion(fixVersion, projects) {
    const config = new ConfigProvider();
    const jql = buildJqlForVersion(fixVersion, projects);
    const body = {
        expand: ["names"],
        fields: ["summary", config.getReleaseNotesField(), "issuetype", "parent"],
        fieldsByKeys: false,
        jql: jql,
        maxResults: 100,
        startAt: 0,
    };
    const response = await axios({
        method: "post",
        baseURL: JIRA_BASE_URL,
        url: "/rest/api/2/search",
        data: body,
        headers: AUTH_HEADERS,
    });
    return parseIssueResponse(response.data.issues);
}

/**
 * Build a JQL query to find issues based on fix version and project keys
 * @param {string} fixVersion Jira Release
 * @param {Array<string>} projects Project keys
 * @returns {string} JQL query
 */
function buildJqlForVersion(fixVersion, projects) {
    const projectClause = projects.reduce((prev, curr, index) => {
        if (index === 0) {
            return prev + 'project="' + curr + '"';
        } else {
            return prev + 'OR project="' + curr + '"';
        }
    }, "");
    return `(fixVersion in ("${fixVersion}") AND (${projectClause}))`;
}

/**
 * Parse raw issue response data from the Jira API into objects
 * @param {Array} issues Raw list of issues received from the Jira API
 * @returns {Array} Jira issues
 */
function parseIssueResponse(issues) {
    const config = new ConfigProvider();
    return issues.map((issue) => {
        const finalIssue = {
            key: issue.key,
            link: JIRA_BASE_URL + "/browse/" + issue.key,
            summary: issue.fields.summary,
            releaseNotes:
                issue.fields[config.getReleaseNotesField()] !== null
                    ? issue.fields[config.getReleaseNotesField()]
                    : config.getMissingReleaseNotesText(),
            originalType: issue.fields.issuetype.name,
            type: issue.fields.issuetype.name,
        };

        if (finalIssue.type === "Sub-task") {
            finalIssue.type = issue.fields.parent.fields.issuetype.name;
        }

        return finalIssue;
    });
}

module.exports = {
    getPageIdByName,
    getIssuesForVersion,
    createPage,
    getSpaceId,
};
