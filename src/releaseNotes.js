"use strict"
/**
 * @module releaseNotes Provides APIs to generate release notes
 */

const Content = require("./content");

/**
 * Create release notes
 * @param {Array} pageProperties Page properties
 * @param {Array} sections Sections
 * @param {Array} issues Jira issues
 * @param {string} fallbackEmoji Fallback emoji if section emoji is invalid
 * @returns {string} Release notes
 */
function createReleaseNotes(pageProperties, sections, issues, fallbackEmoji) {
    const releaseNotes = new Content();

    releaseNotes.addPageProperties(pageProperties);
    sections.forEach((section) => {
        const issuesForSection = filterIssuesByType(
            issues,
            section.includeIssueTypes
        );
        if (issuesForSection.length > 0) {
            releaseNotes.addSection(
                section.title,
                section.subTitle,
                section.emoji,
                fallbackEmoji
            );
            issuesForSection.forEach((issue) => {
                releaseNotes.addReleaseNote(
                    issue.key,
                    issue.link,
                    issue.summary,
                    issue.releaseNotes
                );
            });
        }
    });
    return releaseNotes.getContent();
}

/**
 * Filter issues based on type
 * @param {Array} issues Jira issues
 * @param {Array} types Issue types to return
 * @returns {Array} Issues matching specified type
 */
function filterIssuesByType(issues, types) {
    return issues.filter((issue) => {
        const normalizedTypes = types.map((type) => type.toLowerCase());
        return normalizedTypes.includes(issue.type.toLowerCase());
    });
}

module.exports = {
    createReleaseNotes,
};
