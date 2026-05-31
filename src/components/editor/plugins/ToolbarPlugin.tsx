import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
	$createParagraphNode,
	$getSelection,
	$isRangeSelection,
	$isRootOrShadowRoot,
	SELECTION_CHANGE_COMMAND,
	COMMAND_PRIORITY_LOW,
	FORMAT_TEXT_COMMAND,
} from "lexical";
import { $setBlocksType } from "@lexical/selection";
import {
	$createHeadingNode,
	$isHeadingNode,
	type HeadingTagType,
} from "@lexical/rich-text";
import { $findMatchingParent, mergeRegister } from "@lexical/utils";
import { Bold, Italic, Underline } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

const BLOCK_TYPES = [
	{ label: "Paragraph", value: "paragraph" },
	{ label: "Heading 1", value: "h1" },
	{ label: "Heading 2", value: "h2" },
	{ label: "Heading 3", value: "h3" },
] as const;

export default function ToolbarPlugin() {
	const [editor] = useLexicalComposerContext();
	const [isBold, setIsBold] = useState(false);
	const [isItalic, setIsItalic] = useState(false);
	const [isUnderline, setIsUnderline] = useState(false);
	const [blockType, setBlockType] = useState("paragraph");

	const updateToolbar = useCallback(() => {
		const selection = $getSelection();
		if ($isRangeSelection(selection)) {
			setIsBold(selection.hasFormat("bold"));
			setIsItalic(selection.hasFormat("italic"));
			setIsUnderline(selection.hasFormat("underline"));

			const anchorNode = selection.anchor.getNode();
			const element = $findMatchingParent(anchorNode, (node) => {
				const parent = node.getParent();
				return $isHeadingNode(node) || $isRootOrShadowRoot(parent);
			});

			if ($isHeadingNode(element)) {
				setBlockType(element.getTag());
			} else {
				setBlockType("paragraph");
			}
		}
	}, []);

	useEffect(() => {
		return mergeRegister(
			editor.registerCommand(
				SELECTION_CHANGE_COMMAND,
				() => {
					updateToolbar();
					return false;
				},
				COMMAND_PRIORITY_LOW,
			),
		);
	}, [editor, updateToolbar]);

	const handleBlockChange = (value: string) => {
		editor.update(() => {
			if (value === "paragraph") {
				$setBlocksType($getSelection(), () => $createParagraphNode());
			} else {
				$setBlocksType($getSelection(), () =>
					$createHeadingNode(value as HeadingTagType),
				);
			}
		});
	};

	return (
		<div className="flex items-center gap-1 border-b border-input px-2 py-1.5 flex-wrap">
			<button
				type="button"
				onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
				className={`p-1 rounded hover:bg-muted transition-colors ${
					isBold ? "bg-muted text-foreground" : "text-muted-foreground"
				}`}
				title="Bold"
			>
				<Bold className="h-4 w-4" />
			</button>
			<button
				type="button"
				onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
				className={`p-1 rounded hover:bg-muted transition-colors ${
					isItalic ? "bg-muted text-foreground" : "text-muted-foreground"
				}`}
				title="Italic"
			>
				<Italic className="h-4 w-4" />
			</button>
			<button
				type="button"
				onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
				className={`p-1 rounded hover:bg-muted transition-colors ${
					isUnderline ? "bg-muted text-foreground" : "text-muted-foreground"
				}`}
				title="Underline"
			>
				<Underline className="h-4 w-4" />
			</button>

			<div className="w-px h-5 bg-border mx-1" />

			<Select value={blockType} onValueChange={handleBlockChange}>
				<SelectTrigger className="w-[130px] h-7 text-xs">
					<SelectValue placeholder="Style" />
				</SelectTrigger>
				<SelectContent>
					{BLOCK_TYPES.map((t) => (
						<SelectItem key={t.value} value={t.value} className="text-xs">
							{t.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
