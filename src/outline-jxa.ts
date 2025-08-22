import type { Node } from "acorn";
import {
	DocumentSymbol,
	type DocumentSymbolProvider,
	Range,
	SymbolKind,
} from "vscode";
import type {
	ArrowFunctionExpression,
	BaseNode,
	BlockStatement,
	ClassDeclaration,
	DoWhileStatement,
	ForInStatement,
	ForOfStatement,
	ForStatement,
	FunctionDeclaration,
	FunctionExpression,
	Identifier,
	IfStatement,
	Program,
	Statement,
	SwitchStatement,
	TryStatement,
	VariableDeclaration,
	WhileStatement,
	WithStatement,
} from "../types/acorn-types";

/**
 * Creates a DocumentSymbol from an acorn AST node.
 *
 * @param node - The acorn AST node with location information
 * @param name - The name to display for this symbol
 * @param kind - The VS Code SymbolKind for this symbol
 * @returns A DocumentSymbol with proper range and empty children array
 */
function createSymbol(
	node: BaseNode,
	name: string,
	kind: SymbolKind,
): DocumentSymbol {
	const range = new Range(
		node.loc.start.line - 1,
		node.loc.start.column,
		node.loc.end.line - 1,
		node.loc.end.column,
	);
	const symbol = new DocumentSymbol(name, "", kind, range, range);
	symbol.children = [];
	return symbol;
}

/**
 * Processes the body of conditional statements and loops.
 *
 * Handles both block statements (with curly braces) and single statements.
 * For block statements, processes all statements within the block.
 * For single statements, wraps them in an array and processes them.
 *
 * @param stmt - The statement node (either BlockStatement or any other statement)
 * @param parent - The parent DocumentSymbol to add nested symbols to
 * @param processedNodes - WeakSet tracking already processed nodes to avoid duplicates
 */
function processConditionalBody(
	stmt: Statement,
	parent: DocumentSymbol,
	processedNodes: WeakSet<Node>,
) {
	if (stmt.type === "BlockStatement") {
		const blockStmt = stmt as BlockStatement;
		processBlockContent(blockStmt.body, parent, processedNodes);
	} else {
		processBlockContent([stmt], parent, processedNodes);
	}
}

/**
 * Processes variable declaration statements to extract symbols.
 *
 * Handles const, let, and var declarations. Determines the appropriate
 * SymbolKind based on the declaration type and initializer:
 * - Functions (arrow or regular) become Function symbols with nested content
 * - Classes become Class symbols
 * - Constants become Constant symbols
 * - Regular variables become Variable symbols
 *
 * @param node - The VariableDeclaration AST node
 * @param parentArray - Either an array of symbols or a parent symbol with children
 * @param processedNodes - WeakSet tracking already processed nodes to avoid duplicates
 */
function processVariableDeclaration(
	node: VariableDeclaration,
	parentArray: DocumentSymbol[] | DocumentSymbol,
	processedNodes: WeakSet<Node>,
) {
	const targetArray = Array.isArray(parentArray)
		? parentArray
		: parentArray.children || [];

	for (const decl of node.declarations) {
		// Skip destructuring patterns for now
		if (decl.id.type !== "Identifier") continue;

		const id = decl.id as Identifier;
		let kind = SymbolKind.Variable;

		// Determine the symbol kind based on the initializer
		if (decl.init) {
			if (
				decl.init.type === "ArrowFunctionExpression" ||
				decl.init.type === "FunctionExpression"
			) {
				kind = SymbolKind.Function;
				const funcSymbol = createSymbol(decl, id.name, kind);
				targetArray.push(funcSymbol);

				// Process function body if it exists
				const funcExpr = decl.init as
					| ArrowFunctionExpression
					| FunctionExpression;
				if (funcExpr.body.type === "BlockStatement") {
					processBlockContent(funcExpr.body.body, funcSymbol, processedNodes);
				}
				continue;
			}
			if (decl.init.type === "ClassExpression") {
				kind = SymbolKind.Class;
			} else if (node.kind === "const") {
				kind = SymbolKind.Constant;
			}
		} else if (node.kind === "const") {
			kind = SymbolKind.Constant;
		}

		targetArray.push(createSymbol(decl, id.name, kind));
	}
}

/**
 * Recursively processes an array of statements to extract nested symbols.
 *
 * This is the core function that walks through the AST and builds the symbol hierarchy.
 * It handles various JavaScript/JXA constructs including:
 * - Function declarations (with nested content)
 * - Variable declarations (const, let, var)
 * - Control flow statements (if/else, for, while, try/catch, switch)
 * - Block statements
 *
 * Uses a WeakSet to track processed nodes and avoid duplicate processing,
 * which is important when dealing with nested structures.
 *
 * @param statements - Array of AST statement nodes to process
 * @param parent - The parent DocumentSymbol to add discovered symbols to
 * @param processedNodes - WeakSet tracking already processed nodes to avoid duplicates
 */
function processBlockContent(
	statements: Statement[],
	parent: DocumentSymbol,
	processedNodes: WeakSet<Node>,
) {
	for (const stmt of statements) {
		// Skip if already processed
		if (processedNodes.has(stmt)) continue;
		processedNodes.add(stmt);

		switch (stmt.type) {
			case "FunctionDeclaration": {
				const funcDecl = stmt as FunctionDeclaration;
				if (funcDecl.id) {
					const funcSymbol = createSymbol(
						funcDecl,
						funcDecl.id.name,
						SymbolKind.Function,
					);
					parent.children?.push(funcSymbol);

					// Recursively process nested content
					processBlockContent(funcDecl.body.body, funcSymbol, processedNodes);
				}
				break;
			}

			case "VariableDeclaration":
				processVariableDeclaration(
					stmt as VariableDeclaration,
					parent,
					processedNodes,
				);
				break;

			case "IfStatement": {
				const ifStmt = stmt as IfStatement;
				// Process if/else blocks
				processConditionalBody(ifStmt.consequent, parent, processedNodes);
				if (ifStmt.alternate) {
					processConditionalBody(ifStmt.alternate, parent, processedNodes);
				}
				break;
			}

			case "ForStatement": {
				const forStmt = stmt as ForStatement;
				processConditionalBody(forStmt.body, parent, processedNodes);
				break;
			}

			case "ForInStatement": {
				const forInStmt = stmt as ForInStatement;
				processConditionalBody(forInStmt.body, parent, processedNodes);
				break;
			}

			case "ForOfStatement": {
				const forOfStmt = stmt as ForOfStatement;
				processConditionalBody(forOfStmt.body, parent, processedNodes);
				break;
			}

			case "WhileStatement": {
				const whileStmt = stmt as WhileStatement;
				processConditionalBody(whileStmt.body, parent, processedNodes);
				break;
			}

			case "DoWhileStatement": {
				const doWhileStmt = stmt as DoWhileStatement;
				processConditionalBody(doWhileStmt.body, parent, processedNodes);
				break;
			}

			case "TryStatement": {
				const tryStmt = stmt as TryStatement;
				// Process try/catch/finally blocks
				processBlockContent(tryStmt.block.body, parent, processedNodes);
				if (tryStmt.handler) {
					processBlockContent(
						tryStmt.handler.body.body,
						parent,
						processedNodes,
					);
				}
				if (tryStmt.finalizer) {
					processBlockContent(tryStmt.finalizer.body, parent, processedNodes);
				}
				break;
			}

			case "SwitchStatement": {
				const switchStmt = stmt as SwitchStatement;
				// Process switch cases
				for (const switchCase of switchStmt.cases) {
					processBlockContent(switchCase.consequent, parent, processedNodes);
				}
				break;
			}

			case "WithStatement": {
				const withStmt = stmt as WithStatement;
				processConditionalBody(withStmt.body, parent, processedNodes);
				break;
			}

			case "BlockStatement": {
				const blockStmt = stmt as BlockStatement;
				// Process nested block statements
				processBlockContent(blockStmt.body, parent, processedNodes);
				break;
			}
		}
	}
}

/**
 * JXA (JavaScript for Automation) Document Symbol Provider.
 *
 * Uses the acorn JavaScript parser to build a proper symbol hierarchy for JXA files.
 * This implementation manually walks the AST to extract symbols and maintain their
 * hierarchical relationships, ensuring that:
 * - Nested functions within classes are properly shown
 * - Variables are scoped correctly to their containing functions
 * - All JavaScript constructs (classes, methods, functions, variables) are recognized
 *
 * The provider handles various edge cases including:
 * - Arrow functions and function expressions
 * - Class declarations and expressions
 * - Destructuring patterns (currently skipped)
 * - Control flow statements with nested content
 * - Duplicate symbol prevention using WeakSet tracking
 */
export const jxaSymbolProvider: DocumentSymbolProvider = {
	async provideDocumentSymbols(document) {
		try {
			const text = document.getText();

			// Use acorn to parse JavaScript/JXA code
			const acorn = await import("acorn");

			// Parse the code into an AST
			const ast = acorn.parse(text, {
				ecmaVersion: "latest",
				sourceType: "script", // JXA behaves more like a script than a module
				locations: true,
				allowReturnOutsideFunction: true,
				allowImportExportEverywhere: true,
				allowAwaitOutsideFunction: true,
			}) as Program;

			const symbols: DocumentSymbol[] = [];
			const processedNodes = new WeakSet<Node>();

			// Process top-level declarations only
			for (const node of ast.body) {
				switch (node.type) {
					case "ClassDeclaration": {
						const classDecl = node as ClassDeclaration;
						if (classDecl.id) {
							const classSymbol = createSymbol(
								classDecl,
								classDecl.id.name,
								SymbolKind.Class,
							);
							symbols.push(classSymbol);
							processedNodes.add(node);

							// Process class methods
							for (const member of classDecl.body.body) {
								if (member.type === "MethodDefinition" && member.key) {
									const key = member.key as Identifier;
									const methodName = key.name;
									if (methodName) {
										const methodSymbol = createSymbol(
											member,
											methodName,
											member.kind === "constructor"
												? SymbolKind.Constructor
												: SymbolKind.Method,
										);
										classSymbol.children.push(methodSymbol);

										// Process method body
										if (member.value.body) {
											processBlockContent(
												member.value.body.body,
												methodSymbol,
												processedNodes,
											);
										}
									}
								}
							}
						}
						break;
					}

					case "FunctionDeclaration": {
						const funcDecl = node as FunctionDeclaration;
						if (funcDecl.id) {
							const funcSymbol = createSymbol(
								funcDecl,
								funcDecl.id.name,
								SymbolKind.Function,
							);
							symbols.push(funcSymbol);
							processedNodes.add(node);

							// Process function body
							processBlockContent(
								funcDecl.body.body,
								funcSymbol,
								processedNodes,
							);
						}
						break;
					}

					case "VariableDeclaration":
						processVariableDeclaration(
							node as VariableDeclaration,
							symbols,
							processedNodes,
						);
						break;
				}
			}

			return symbols;
		} catch (error) {
			console.error("Error parsing JXA file:", error);
			return [];
		}
	},
};
