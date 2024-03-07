import { json, jsonParseLinter } from "@codemirror/lang-json";
import { lintGutter, linter } from "@codemirror/lint";
import ReactCodeMirror, { ViewUpdate, oneDark } from "@uiw/react-codemirror";
import React, { useEffect, useRef, useState } from "react";
import styles from "./JSONCodeEditor.module.scss";

export type OnCodeUpdate = (value: string) => void;

export default function JSONCodeEditor({
	code: initialCode,
	onCodeUpdate,
}: {
	code: string;
	onCodeUpdate: OnCodeUpdate;
}) {
	const [code, setCode] = useState<string>(initialCode);

	useEffect(() => {
		setCode(initialCode);
	}, [initialCode]);

	const handleCodeUpdate = (value: string, viewUpdate: ViewUpdate) => {
		setCode(value);
		onCodeUpdate(value);
	};

	return (
		<div className={styles.jsonCodeEditor}>
			<ReactCodeMirror
				className="code-editor"
				theme={oneDark}
				value={code}
				onChange={handleCodeUpdate}
				extensions={[json(), linter(jsonParseLinter()), lintGutter()]}
			/>
		</div>
	);
}
