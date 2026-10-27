import MarkdownIt from 'markdown-it';

// Provider output is untrusted: raw HTML and remote images stay disabled.
const markdown = new MarkdownIt({html: false, linkify: false, breaks: true});
markdown.disable('image');
export function renderChatMarkdown(text: string): string {
  return markdown.render(text);
}
