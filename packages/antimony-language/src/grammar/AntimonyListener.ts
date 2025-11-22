// Generated from ./src/grammar/Antimony.g4 by ANTLR 4.9.0-SNAPSHOT


import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";

import { SumContext } from "./AntimonyParser";
import { ProductContext } from "./AntimonyParser";
import { PowerContext } from "./AntimonyParser";
import { GroupContext } from "./AntimonyParser";
import { LogicalContext } from "./AntimonyParser";
import { CompareContext } from "./AntimonyParser";
import { VarContext } from "./AntimonyParser";
import { NegativeContext } from "./AntimonyParser";
import { PositiveContext } from "./AntimonyParser";
import { NumberContext } from "./AntimonyParser";
import { CallContext } from "./AntimonyParser";
import { RootContext } from "./AntimonyParser";
import { StatementSeparatorContext } from "./AntimonyParser";
import { TopLevelStatementContext } from "./AntimonyParser";
import { StatementListContext } from "./AntimonyParser";
import { StatementContext } from "./AntimonyParser";
import { ModelContext } from "./AntimonyParser";
import { ExportListContext } from "./AntimonyParser";
import { ReactionContext } from "./AntimonyParser";
import { ReactionNameContext } from "./AntimonyParser";
import { ReactionFormulaContext } from "./AntimonyParser";
import { ReactantListContext } from "./AntimonyParser";
import { ReactantContext } from "./AntimonyParser";
import { CompartmentSpecifierContext } from "./AntimonyParser";
import { AssignmentContext } from "./AntimonyParser";
import { FormulaContext } from "./AntimonyParser";
import { FunctionCallContext } from "./AntimonyParser";
import { ParameterListContext } from "./AntimonyParser";
import { VariableContext } from "./AntimonyParser";
import { ModelCallContext } from "./AntimonyParser";


/**
 * This interface defines a complete listener for a parse tree produced by
 * `AntimonyParser`.
 */
export interface AntimonyListener extends ParseTreeListener {
	/**
	 * Enter a parse tree produced by the `sum`
	 * labeled alternative in `AntimonyParser.formula`.
	 * @param ctx the parse tree
	 */
	enterSum?: (ctx: SumContext) => void;
	/**
	 * Exit a parse tree produced by the `sum`
	 * labeled alternative in `AntimonyParser.formula`.
	 * @param ctx the parse tree
	 */
	exitSum?: (ctx: SumContext) => void;

	/**
	 * Enter a parse tree produced by the `product`
	 * labeled alternative in `AntimonyParser.formula`.
	 * @param ctx the parse tree
	 */
	enterProduct?: (ctx: ProductContext) => void;
	/**
	 * Exit a parse tree produced by the `product`
	 * labeled alternative in `AntimonyParser.formula`.
	 * @param ctx the parse tree
	 */
	exitProduct?: (ctx: ProductContext) => void;

	/**
	 * Enter a parse tree produced by the `power`
	 * labeled alternative in `AntimonyParser.formula`.
	 * @param ctx the parse tree
	 */
	enterPower?: (ctx: PowerContext) => void;
	/**
	 * Exit a parse tree produced by the `power`
	 * labeled alternative in `AntimonyParser.formula`.
	 * @param ctx the parse tree
	 */
	exitPower?: (ctx: PowerContext) => void;

	/**
	 * Enter a parse tree produced by the `group`
	 * labeled alternative in `AntimonyParser.formula`.
	 * @param ctx the parse tree
	 */
	enterGroup?: (ctx: GroupContext) => void;
	/**
	 * Exit a parse tree produced by the `group`
	 * labeled alternative in `AntimonyParser.formula`.
	 * @param ctx the parse tree
	 */
	exitGroup?: (ctx: GroupContext) => void;

	/**
	 * Enter a parse tree produced by the `logical`
	 * labeled alternative in `AntimonyParser.formula`.
	 * @param ctx the parse tree
	 */
	enterLogical?: (ctx: LogicalContext) => void;
	/**
	 * Exit a parse tree produced by the `logical`
	 * labeled alternative in `AntimonyParser.formula`.
	 * @param ctx the parse tree
	 */
	exitLogical?: (ctx: LogicalContext) => void;

	/**
	 * Enter a parse tree produced by the `compare`
	 * labeled alternative in `AntimonyParser.formula`.
	 * @param ctx the parse tree
	 */
	enterCompare?: (ctx: CompareContext) => void;
	/**
	 * Exit a parse tree produced by the `compare`
	 * labeled alternative in `AntimonyParser.formula`.
	 * @param ctx the parse tree
	 */
	exitCompare?: (ctx: CompareContext) => void;

	/**
	 * Enter a parse tree produced by the `var`
	 * labeled alternative in `AntimonyParser.formula`.
	 * @param ctx the parse tree
	 */
	enterVar?: (ctx: VarContext) => void;
	/**
	 * Exit a parse tree produced by the `var`
	 * labeled alternative in `AntimonyParser.formula`.
	 * @param ctx the parse tree
	 */
	exitVar?: (ctx: VarContext) => void;

	/**
	 * Enter a parse tree produced by the `negative`
	 * labeled alternative in `AntimonyParser.formula`.
	 * @param ctx the parse tree
	 */
	enterNegative?: (ctx: NegativeContext) => void;
	/**
	 * Exit a parse tree produced by the `negative`
	 * labeled alternative in `AntimonyParser.formula`.
	 * @param ctx the parse tree
	 */
	exitNegative?: (ctx: NegativeContext) => void;

	/**
	 * Enter a parse tree produced by the `positive`
	 * labeled alternative in `AntimonyParser.formula`.
	 * @param ctx the parse tree
	 */
	enterPositive?: (ctx: PositiveContext) => void;
	/**
	 * Exit a parse tree produced by the `positive`
	 * labeled alternative in `AntimonyParser.formula`.
	 * @param ctx the parse tree
	 */
	exitPositive?: (ctx: PositiveContext) => void;

	/**
	 * Enter a parse tree produced by the `number`
	 * labeled alternative in `AntimonyParser.formula`.
	 * @param ctx the parse tree
	 */
	enterNumber?: (ctx: NumberContext) => void;
	/**
	 * Exit a parse tree produced by the `number`
	 * labeled alternative in `AntimonyParser.formula`.
	 * @param ctx the parse tree
	 */
	exitNumber?: (ctx: NumberContext) => void;

	/**
	 * Enter a parse tree produced by the `call`
	 * labeled alternative in `AntimonyParser.formula`.
	 * @param ctx the parse tree
	 */
	enterCall?: (ctx: CallContext) => void;
	/**
	 * Exit a parse tree produced by the `call`
	 * labeled alternative in `AntimonyParser.formula`.
	 * @param ctx the parse tree
	 */
	exitCall?: (ctx: CallContext) => void;

	/**
	 * Enter a parse tree produced by `AntimonyParser.root`.
	 * @param ctx the parse tree
	 */
	enterRoot?: (ctx: RootContext) => void;
	/**
	 * Exit a parse tree produced by `AntimonyParser.root`.
	 * @param ctx the parse tree
	 */
	exitRoot?: (ctx: RootContext) => void;

	/**
	 * Enter a parse tree produced by `AntimonyParser.statementSeparator`.
	 * @param ctx the parse tree
	 */
	enterStatementSeparator?: (ctx: StatementSeparatorContext) => void;
	/**
	 * Exit a parse tree produced by `AntimonyParser.statementSeparator`.
	 * @param ctx the parse tree
	 */
	exitStatementSeparator?: (ctx: StatementSeparatorContext) => void;

	/**
	 * Enter a parse tree produced by `AntimonyParser.topLevelStatement`.
	 * @param ctx the parse tree
	 */
	enterTopLevelStatement?: (ctx: TopLevelStatementContext) => void;
	/**
	 * Exit a parse tree produced by `AntimonyParser.topLevelStatement`.
	 * @param ctx the parse tree
	 */
	exitTopLevelStatement?: (ctx: TopLevelStatementContext) => void;

	/**
	 * Enter a parse tree produced by `AntimonyParser.statementList`.
	 * @param ctx the parse tree
	 */
	enterStatementList?: (ctx: StatementListContext) => void;
	/**
	 * Exit a parse tree produced by `AntimonyParser.statementList`.
	 * @param ctx the parse tree
	 */
	exitStatementList?: (ctx: StatementListContext) => void;

	/**
	 * Enter a parse tree produced by `AntimonyParser.statement`.
	 * @param ctx the parse tree
	 */
	enterStatement?: (ctx: StatementContext) => void;
	/**
	 * Exit a parse tree produced by `AntimonyParser.statement`.
	 * @param ctx the parse tree
	 */
	exitStatement?: (ctx: StatementContext) => void;

	/**
	 * Enter a parse tree produced by `AntimonyParser.model`.
	 * @param ctx the parse tree
	 */
	enterModel?: (ctx: ModelContext) => void;
	/**
	 * Exit a parse tree produced by `AntimonyParser.model`.
	 * @param ctx the parse tree
	 */
	exitModel?: (ctx: ModelContext) => void;

	/**
	 * Enter a parse tree produced by `AntimonyParser.exportList`.
	 * @param ctx the parse tree
	 */
	enterExportList?: (ctx: ExportListContext) => void;
	/**
	 * Exit a parse tree produced by `AntimonyParser.exportList`.
	 * @param ctx the parse tree
	 */
	exitExportList?: (ctx: ExportListContext) => void;

	/**
	 * Enter a parse tree produced by `AntimonyParser.reaction`.
	 * @param ctx the parse tree
	 */
	enterReaction?: (ctx: ReactionContext) => void;
	/**
	 * Exit a parse tree produced by `AntimonyParser.reaction`.
	 * @param ctx the parse tree
	 */
	exitReaction?: (ctx: ReactionContext) => void;

	/**
	 * Enter a parse tree produced by `AntimonyParser.reactionName`.
	 * @param ctx the parse tree
	 */
	enterReactionName?: (ctx: ReactionNameContext) => void;
	/**
	 * Exit a parse tree produced by `AntimonyParser.reactionName`.
	 * @param ctx the parse tree
	 */
	exitReactionName?: (ctx: ReactionNameContext) => void;

	/**
	 * Enter a parse tree produced by `AntimonyParser.reactionFormula`.
	 * @param ctx the parse tree
	 */
	enterReactionFormula?: (ctx: ReactionFormulaContext) => void;
	/**
	 * Exit a parse tree produced by `AntimonyParser.reactionFormula`.
	 * @param ctx the parse tree
	 */
	exitReactionFormula?: (ctx: ReactionFormulaContext) => void;

	/**
	 * Enter a parse tree produced by `AntimonyParser.reactantList`.
	 * @param ctx the parse tree
	 */
	enterReactantList?: (ctx: ReactantListContext) => void;
	/**
	 * Exit a parse tree produced by `AntimonyParser.reactantList`.
	 * @param ctx the parse tree
	 */
	exitReactantList?: (ctx: ReactantListContext) => void;

	/**
	 * Enter a parse tree produced by `AntimonyParser.reactant`.
	 * @param ctx the parse tree
	 */
	enterReactant?: (ctx: ReactantContext) => void;
	/**
	 * Exit a parse tree produced by `AntimonyParser.reactant`.
	 * @param ctx the parse tree
	 */
	exitReactant?: (ctx: ReactantContext) => void;

	/**
	 * Enter a parse tree produced by `AntimonyParser.compartmentSpecifier`.
	 * @param ctx the parse tree
	 */
	enterCompartmentSpecifier?: (ctx: CompartmentSpecifierContext) => void;
	/**
	 * Exit a parse tree produced by `AntimonyParser.compartmentSpecifier`.
	 * @param ctx the parse tree
	 */
	exitCompartmentSpecifier?: (ctx: CompartmentSpecifierContext) => void;

	/**
	 * Enter a parse tree produced by `AntimonyParser.assignment`.
	 * @param ctx the parse tree
	 */
	enterAssignment?: (ctx: AssignmentContext) => void;
	/**
	 * Exit a parse tree produced by `AntimonyParser.assignment`.
	 * @param ctx the parse tree
	 */
	exitAssignment?: (ctx: AssignmentContext) => void;

	/**
	 * Enter a parse tree produced by `AntimonyParser.formula`.
	 * @param ctx the parse tree
	 */
	enterFormula?: (ctx: FormulaContext) => void;
	/**
	 * Exit a parse tree produced by `AntimonyParser.formula`.
	 * @param ctx the parse tree
	 */
	exitFormula?: (ctx: FormulaContext) => void;

	/**
	 * Enter a parse tree produced by `AntimonyParser.functionCall`.
	 * @param ctx the parse tree
	 */
	enterFunctionCall?: (ctx: FunctionCallContext) => void;
	/**
	 * Exit a parse tree produced by `AntimonyParser.functionCall`.
	 * @param ctx the parse tree
	 */
	exitFunctionCall?: (ctx: FunctionCallContext) => void;

	/**
	 * Enter a parse tree produced by `AntimonyParser.parameterList`.
	 * @param ctx the parse tree
	 */
	enterParameterList?: (ctx: ParameterListContext) => void;
	/**
	 * Exit a parse tree produced by `AntimonyParser.parameterList`.
	 * @param ctx the parse tree
	 */
	exitParameterList?: (ctx: ParameterListContext) => void;

	/**
	 * Enter a parse tree produced by `AntimonyParser.variable`.
	 * @param ctx the parse tree
	 */
	enterVariable?: (ctx: VariableContext) => void;
	/**
	 * Exit a parse tree produced by `AntimonyParser.variable`.
	 * @param ctx the parse tree
	 */
	exitVariable?: (ctx: VariableContext) => void;

	/**
	 * Enter a parse tree produced by `AntimonyParser.modelCall`.
	 * @param ctx the parse tree
	 */
	enterModelCall?: (ctx: ModelCallContext) => void;
	/**
	 * Exit a parse tree produced by `AntimonyParser.modelCall`.
	 * @param ctx the parse tree
	 */
	exitModelCall?: (ctx: ModelCallContext) => void;
}

