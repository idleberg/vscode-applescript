/**
 * Extended Acorn AST type definitions for the specific nodes we use.
 * These extend the base acorn types with the properties we need to access.
 */

import type { Node, SourceLocation } from 'acorn';

export interface BaseNode extends Node {
	loc: SourceLocation;
}

export interface Identifier extends BaseNode {
	type: 'Identifier';
	name: string;
}

export interface VariableDeclarator extends BaseNode {
	type: 'VariableDeclarator';
	id: Identifier | Pattern;
	init?: Expression;
}

export interface VariableDeclaration extends BaseNode {
	type: 'VariableDeclaration';
	declarations: VariableDeclarator[];
	kind: 'const' | 'let' | 'var';
}

export interface BlockStatement extends BaseNode {
	type: 'BlockStatement';
	body: Statement[];
}

export interface FunctionDeclaration extends BaseNode {
	type: 'FunctionDeclaration';
	id: Identifier | null;
	params: Pattern[];
	body: BlockStatement;
}

export interface FunctionExpression extends BaseNode {
	type: 'FunctionExpression';
	id?: Identifier | null;
	params: Pattern[];
	body: BlockStatement;
}

export interface ArrowFunctionExpression extends BaseNode {
	type: 'ArrowFunctionExpression';
	params: Pattern[];
	body: BlockStatement | Expression;
}

export interface ClassDeclaration extends BaseNode {
	type: 'ClassDeclaration';
	id: Identifier | null;
	body: ClassBody;
}

export interface ClassExpression extends BaseNode {
	type: 'ClassExpression';
	id?: Identifier | null;
	body: ClassBody;
}

export interface ClassBody extends BaseNode {
	type: 'ClassBody';
	body: MethodDefinition[];
}

export interface MethodDefinition extends BaseNode {
	type: 'MethodDefinition';
	key: Identifier | Expression;
	value: FunctionExpression;
	kind: 'constructor' | 'method' | 'get' | 'set';
	static: boolean;
}

export interface IfStatement extends BaseNode {
	type: 'IfStatement';
	test: Expression;
	consequent: Statement;
	alternate?: Statement | null;
}

export interface ForStatement extends BaseNode {
	type: 'ForStatement';
	init?: VariableDeclaration | Expression | null;
	test?: Expression | null;
	update?: Expression | null;
	body: Statement;
}

export interface ForInStatement extends BaseNode {
	type: 'ForInStatement';
	left: VariableDeclaration | Pattern;
	right: Expression;
	body: Statement;
}

export interface ForOfStatement extends BaseNode {
	type: 'ForOfStatement';
	left: VariableDeclaration | Pattern;
	right: Expression;
	body: Statement;
}

export interface WhileStatement extends BaseNode {
	type: 'WhileStatement';
	test: Expression;
	body: Statement;
}

export interface DoWhileStatement extends BaseNode {
	type: 'DoWhileStatement';
	body: Statement;
	test: Expression;
}

export interface TryStatement extends BaseNode {
	type: 'TryStatement';
	block: BlockStatement;
	handler?: CatchClause | null;
	finalizer?: BlockStatement | null;
}

export interface CatchClause extends BaseNode {
	type: 'CatchClause';
	param?: Pattern | null;
	body: BlockStatement;
}

export interface SwitchStatement extends BaseNode {
	type: 'SwitchStatement';
	discriminant: Expression;
	cases: SwitchCase[];
}

export interface SwitchCase extends BaseNode {
	type: 'SwitchCase';
	test?: Expression | null;
	consequent: Statement[];
}

export interface WithStatement extends BaseNode {
	type: 'WithStatement';
	object: Expression;
	body: Statement;
}

export interface NewExpression extends BaseNode {
	type: 'NewExpression';
	callee: Expression | Identifier;
	arguments: Expression[];
}

export interface Program extends BaseNode {
	type: 'Program';
	body: Statement[];
	sourceType: 'script' | 'module';
}

// Union types for categories
export type Statement =
	| BlockStatement
	| VariableDeclaration
	| FunctionDeclaration
	| ClassDeclaration
	| IfStatement
	| ForStatement
	| ForInStatement
	| ForOfStatement
	| WhileStatement
	| DoWhileStatement
	| TryStatement
	| SwitchStatement
	| WithStatement
	| ExpressionStatement
	| ReturnStatement
	| ThrowStatement
	| BreakStatement
	| ContinueStatement;

export type Expression =
	| Identifier
	| FunctionExpression
	| ArrowFunctionExpression
	| ClassExpression
	| NewExpression
	| CallExpression
	| MemberExpression
	| AssignmentExpression
	| BinaryExpression
	| UnaryExpression
	| UpdateExpression
	| LogicalExpression
	| ConditionalExpression
	| ArrayExpression
	| ObjectExpression
	| Literal;

export type Pattern = Identifier | ObjectPattern | ArrayPattern | RestElement | AssignmentPattern;

// Additional types we reference but don't fully define
export interface ExpressionStatement extends BaseNode {
	type: 'ExpressionStatement';
	expression: Expression;
}

export interface ReturnStatement extends BaseNode {
	type: 'ReturnStatement';
	argument?: Expression | null;
}

export interface ThrowStatement extends BaseNode {
	type: 'ThrowStatement';
	argument: Expression;
}

export interface BreakStatement extends BaseNode {
	type: 'BreakStatement';
	label?: Identifier | null;
}

export interface ContinueStatement extends BaseNode {
	type: 'ContinueStatement';
	label?: Identifier | null;
}

export interface CallExpression extends BaseNode {
	type: 'CallExpression';
	callee: Expression;
	arguments: Expression[];
}

export interface MemberExpression extends BaseNode {
	type: 'MemberExpression';
	object: Expression;
	property: Expression;
	computed: boolean;
}

export interface AssignmentExpression extends BaseNode {
	type: 'AssignmentExpression';
	operator: string;
	left: Pattern | Expression;
	right: Expression;
}

export interface BinaryExpression extends BaseNode {
	type: 'BinaryExpression';
	operator: string;
	left: Expression;
	right: Expression;
}

export interface UnaryExpression extends BaseNode {
	type: 'UnaryExpression';
	operator: string;
	argument: Expression;
	prefix: boolean;
}

export interface UpdateExpression extends BaseNode {
	type: 'UpdateExpression';
	operator: '++' | '--';
	argument: Expression;
	prefix: boolean;
}

export interface LogicalExpression extends BaseNode {
	type: 'LogicalExpression';
	operator: '||' | '&&' | '??';
	left: Expression;
	right: Expression;
}

export interface ConditionalExpression extends BaseNode {
	type: 'ConditionalExpression';
	test: Expression;
	consequent: Expression;
	alternate: Expression;
}

export interface ArrayExpression extends BaseNode {
	type: 'ArrayExpression';
	elements: (Expression | null)[];
}

export interface ObjectExpression extends BaseNode {
	type: 'ObjectExpression';
	properties: Property[];
}

export interface Property extends BaseNode {
	type: 'Property';
	key: Expression;
	value: Expression;
	kind: 'init' | 'get' | 'set';
	shorthand: boolean;
	computed: boolean;
}

export interface Literal extends BaseNode {
	type: 'Literal';
	value: string | number | boolean | null | RegExp;
	raw: string;
}

export interface ObjectPattern extends BaseNode {
	type: 'ObjectPattern';
	properties: Property[];
}

export interface ArrayPattern extends BaseNode {
	type: 'ArrayPattern';
	elements: (Pattern | null)[];
}

export interface RestElement extends BaseNode {
	type: 'RestElement';
	argument: Pattern;
}

export interface AssignmentPattern extends BaseNode {
	type: 'AssignmentPattern';
	left: Pattern;
	right: Expression;
}
