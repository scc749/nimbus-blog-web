"use client";

import type { ForwardedRef } from "react";

import {
  MDXEditor,
  type MDXEditorMethods,
  type MDXEditorProps,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  linkPlugin,
  linkDialogPlugin,
  imagePlugin,
  tablePlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  diffSourcePlugin,
  frontmatterPlugin,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  CodeToggle,
  CreateLink,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  InsertCodeBlock,
  ListsToggle,
  Separator,
  DiffSourceToggleWrapper,
} from "@mdxeditor/editor";

import "@mdxeditor/editor/style.css";
import "@/styles/mdx-editor-heroui.css";
import {
  generateUploadURL,
  uploadFileToPresignedURL,
} from "@/lib/api/admin/file";
import { getFileURL } from "@/lib/api/v1/file";

function EditorToolbar() {
  return (
    <DiffSourceToggleWrapper>
      <UndoRedo />
      <Separator />
      <BoldItalicUnderlineToggles />
      <CodeToggle />
      <Separator />
      <BlockTypeSelect />
      <Separator />
      <ListsToggle />
      <Separator />
      <CreateLink />
      <InsertImage />
      <InsertTable />
      <InsertThematicBreak />
      <InsertCodeBlock />
    </DiffSourceToggleWrapper>
  );
}

export default function InitializedMDXEditor({
  editorRef,
  ...props
}: { editorRef: ForwardedRef<MDXEditorMethods> | null } & MDXEditorProps) {
  return (
    <MDXEditor
      plugins={[
        headingsPlugin(),
        listsPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        markdownShortcutPlugin(),
        linkPlugin(),
        linkDialogPlugin(),
        imagePlugin({
          imageUploadHandler: async (image: File) => {
            const { object_key, upload_url } = await generateUploadURL({
              upload_type: "post_content",
              content_type: image.type,
              file_name: image.name,
              file_size: image.size,
            });

            await uploadFileToPresignedURL(upload_url, image);

            return getFileURL(object_key);
          },
        }),
        tablePlugin(),
        frontmatterPlugin(),
        codeBlockPlugin({ defaultCodeBlockLanguage: "txt" }),
        codeMirrorPlugin({
          codeBlockLanguages: {
            txt: "Text",
            js: "JavaScript",
            ts: "TypeScript",
            tsx: "TSX",
            jsx: "JSX",
            css: "CSS",
            html: "HTML",
            json: "JSON",
            go: "Go",
            python: "Python",
            bash: "Bash",
            sql: "SQL",
            yaml: "YAML",
            markdown: "Markdown",
          },
        }),
        diffSourcePlugin({ viewMode: "rich-text" }),
        toolbarPlugin({ toolbarContents: () => <EditorToolbar /> }),
      ]}
      {...props}
      ref={editorRef}
    />
  );
}
