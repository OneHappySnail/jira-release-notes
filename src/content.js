"use strict"
/**
 * @module content Exposes the Content class to generate HTML content for the release notes
 */

/**
 * Content class to build the release notes content in HTML
 */
class Content {
    #content = "";

    /**
     * Add page properties to the content
     * @param {Array} pageProperites
     */
    addPageProperties(pageProperites) {
        this.#content += `<ac:structured-macro ac:name="details"><ac:parameter ac:name="label">status</ac:parameter><ac:rich-text-body><table><tbody>`;

        pageProperites.forEach((pageProperty) => {
            this.#addPageProperty(pageProperty.name, pageProperty.value);
        });

        this.#content += `</tbody></table></ac:rich-text-body></ac:structured-macro>`;
    }

    /**
     * Add a section to the content
     * @param {string} title Section title
     * @param {string} subTitle Section sub title (italic below title)
     * @param {string} emoji Emoji before section title
     * @param {string} fallbackEmoji Fallback emojie if section does not specify a valid emoji
     */
    addSection(title, subTitle, emoji, fallbackEmoji) {
        const titleHtml = this.#escapeHtml(title);
        const subTitleHtml = this.#escapeHtml(subTitle);
        const emojiElement = `<ac:emoticon ac:name="blue-star" ac:emoji-shortname=":${emoji}:" ac:emoji-fallback="${fallbackEmoji}"/>`;
        this.#content += `<h1>${emojiElement} ${titleHtml}</h1><p><em>${subTitleHtml}</em></p>`;
    }

    /**
     * Return the content as a single string
     * @public
     * @returns {string} The content
     */
    getContent() {
        return this.#content;
    }

    /**
     * Add a release note to the content
     * @param {string} key Issue key
     * @param {string} link Jira issue link
     * @param {string} summary Title of the issue
     * @param {string} releaseNotes The release notes
     */
    addReleaseNote(key, link, summary, releaseNotes) {
        const summaryHtml = this.#escapeHtml(summary);
        this.#content += `<h3><a href="${link}">${key}</a> ${summaryHtml}</h3><h5>Release Notes</h5>`;
        this.#makeReleaseNoteParagraph(releaseNotes);
    }

    /**
     * Adds paragraphs to the content for each line of a release note
     * @private
     * @param {string} releaseNotes Raw release notes
     */
    #makeReleaseNoteParagraph(releaseNotes) {
        const lines = releaseNotes.split("\n");
        lines.forEach((line) => {
            const lineHtml = this.#escapeHtml(line);
            this.#content += `<p>${lineHtml}</p>`;
        });
    }

    /**
     * Adds a single page property to the content
     * @private
     * @param {Object} pageProperty pageProperty object
     */
    #addPageProperty(name, value) {
        const nameHtml = this.#escapeHtml(name);
        const valueHtml = this.#escapeHtml(value);
        this.#content += `<tr><th colspan="1" style="text-align: left"><p><strong>${nameHtml}</strong></p></th><td colspan="1" style="text-align: left"><p>${valueHtml}</p></td></tr>`;
    }

    /**
     * Escape special characters and trim white space
     * @private
     * @param {string} text text
     * @returns {string} escaped text
     */
    #escapeHtml(text) {
        return text
            .replace(/\s+/, " ")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;")
            .trim(" ");
    }
}

module.exports = Content;
