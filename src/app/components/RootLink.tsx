import Link from "next/link";
import React from "react";

export default function RootLink({ text }: { text: string }) {
	return <Link href={"/"}>{text}</Link>;
}
