import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HeadingNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { LinkNode } from "@lexical/link";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { MediaNode } from "./nodes/MediaNode";
import MediaPlugin from "./plugins/MediaPlugin";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import FileDropPlugin from "./plugins/FileDropPlugin";

type RichTextEditorProps = {
	value?: string;
	onChange?: (json: string) => void;
	editable?: boolean;
	placeholder?: string;
	uploadFile?: (file: File) => Promise<string>;
};

const EDITOR_THEME = {
	ltr: "text-left",
	rtl: "text-right",
	paragraph: "mb-2 last:mb-0",
	heading: {
		h1: "text-2xl font-bold mb-2 last:mb-0",
		h2: "text-xl font-semibold mb-2 last:mb-0",
		h3: "text-lg font-medium mb-2 last:mb-0",
	},
	list: {
		ul: "list-disc ml-4 mb-2 last:mb-0",
		ol: "list-decimal ml-4 mb-2 last:mb-0",
	},
};

function EditorContent({
	editable,
	placeholder,
}: {
	editable: boolean;
	placeholder?: string;
}) {
	return (
		<div
			className={cn(
				"relative min-h-[80px] px-3 py-2 text-sm",
				editable ? "cursor-text" : "cursor-default",
			)}
		>
			<RichTextPlugin
				contentEditable={
					<ContentEditable className="outline-none min-h-[60px]" />
				}
				placeholder={
					placeholder && editable ? (
						<div className="absolute top-2 left-3 text-muted-foreground pointer-events-none text-sm">
							{placeholder}
						</div>
					) : null
				}
				ErrorBoundary={LexicalErrorBoundary}
			/>
		</div>
	);
}

function OnChangePlugin({
	onChange,
}: {
	onChange: (json: string) => void;
}) {
	const [editor] = useLexicalComposerContext();
	const initializedRef = useRef(false);

	useEffect(() => {
		return editor.registerUpdateListener(
			({ editorState, prevEditorState }) => {
				if (!initializedRef.current) {
					initializedRef.current = true;
					return;
				}
				if (editorState !== prevEditorState) {
					editorState.read(() => {
						const json = JSON.stringify(editorState.toJSON());
						onChange(json);
					});
				}
			},
		);
	}, [editor, onChange]);

	return null;
}

export default function RichTextEditor({
	value,
	onChange,
	editable = true,
	placeholder = "Write something...",
	uploadFile,
}: RichTextEditorProps) {
	let initialEditorState: string | undefined;
	if (value && editable) {
		initialEditorState = value;
	}

	const config = {
		namespace: "ActivityEditor",
		editable,
		theme: EDITOR_THEME,
		onError: (error: unknown) => {
			console.error(error);
		},
		nodes: [HeadingNode, ListNode, ListItemNode, LinkNode, MediaNode],
		editorState: !editable && value ? value : initialEditorState,
	};

	return (
		<div className="border border-input rounded-md bg-background overflow-hidden">
			<LexicalComposer initialConfig={config}>
				{editable && <ToolbarPlugin />}
				<MediaPlugin />
				{editable && <HistoryPlugin />}
				{editable && <AutoFocusPlugin />}
				<EditorContent editable={editable} placeholder={placeholder} />
				{editable && onChange && <OnChangePlugin onChange={onChange} />}
				{editable && uploadFile && <FileDropPlugin uploadFile={uploadFile} />}
			</LexicalComposer>
		</div>
	);
}
