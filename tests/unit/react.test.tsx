import { describe, test } from "@jest/globals";
import React from "react";
import { render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom";

function MyTestComponent({ text }: { text: string }) {
	return <>{text}</>;
}

describe("basic test set if react testing library works", () => {
	test("tests if basic component work", () => {
		render(<MyTestComponent text="Test" />);
		const textElement = screen.getByText("Test");
		expect(textElement).toBeInTheDocument();
	});
});
