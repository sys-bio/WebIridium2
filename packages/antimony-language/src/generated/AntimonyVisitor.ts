// @ts-nocheck
// Generated from ./src/grammar/Antimony.g4 by ANTLR 4.9.0-SNAPSHOT


import { ParseTreeVisitor } from "antlr4ts/tree/ParseTreeVisitor";

import { UnitGroupContext } from "./AntimonyParser";
import { UnitNumberContext } from "./AntimonyParser";
import { UnitNameContext } from "./AntimonyParser";
import { UnitPositiveContext } from "./AntimonyParser";
import { UnitNegativeContext } from "./AntimonyParser";
import { UnitPowerContext } from "./AntimonyParser";
import { UnitProductContext } from "./AntimonyParser";
import { UnitSumContext } from "./AntimonyParser";
import { DeclarationAssignmentContext } from "./AntimonyParser";
import { DeclarationNameContext } from "./AntimonyParser";
import { NameContext } from "./AntimonyParser";
import { SubvariableContext } from "./AntimonyParser";
import { ConstantContext } from "./AntimonyParser";
import { GroupContext } from "./AntimonyParser";
import { NumberContext } from "./AntimonyParser";
import { CallContext } from "./AntimonyParser";
import { VarContext } from "./AntimonyParser";
import { PositiveContext } from "./AntimonyParser";
import { NegativeContext } from "./AntimonyParser";
import { PowerContext } from "./AntimonyParser";
import { ProductContext } from "./AntimonyParser";
import { SumContext } from "./AntimonyParser";
import { CompareContext } from "./AntimonyParser";
import { LogicalContext } from "./AntimonyParser";
import { AnnotationNameContext } from "./AntimonyParser";
import { AnnotationSubItemContext } from "./AntimonyParser";
import { RootContext } from "./AntimonyParser";
import { StatementSeparatorContext } from "./AntimonyParser";
import { TopLevelStatementContext } from "./AntimonyParser";
import { StatementListContext } from "./AntimonyParser";
import { StatementContext } from "./AntimonyParser";
import { ModelContext } from "./AntimonyParser";
import { ExportListContext } from "./AntimonyParser";
import { FormulaContext } from "./AntimonyParser";
import { FunctionCallContext } from "./AntimonyParser";
import { ParameterListContext } from "./AntimonyParser";
import { VariableContext } from "./AntimonyParser";
import { InCompartmentContext } from "./AntimonyParser";
import { ReactionContext } from "./AntimonyParser";
import { ReactionNameContext } from "./AntimonyParser";
import { ReactionFormulaContext } from "./AntimonyParser";
import { ReactantListContext } from "./AntimonyParser";
import { ReactantContext } from "./AntimonyParser";
import { AssignmentContext } from "./AntimonyParser";
import { DeclarationContext } from "./AntimonyParser";
import { DeclarationTermContext } from "./AntimonyParser";
import { EventContext } from "./AntimonyParser";
import { EventNameContext } from "./AntimonyParser";
import { EventOptionsContext } from "./AntimonyParser";
import { EventOptionContext } from "./AntimonyParser";
import { EventAssignmentsContext } from "./AntimonyParser";
import { EventAssignmentContext } from "./AntimonyParser";
import { AnnotationContext } from "./AntimonyParser";
import { VariableAnnotationContext } from "./AntimonyParser";
import { HasAnnotationContext } from "./AntimonyParser";
import { ModelAnnotationContext } from "./AntimonyParser";
import { AnnotationBodyContext } from "./AntimonyParser";
import { AnnotationItemContext } from "./AntimonyParser";
import { StringContext } from "./AntimonyParser";
import { UnitDeclarationContext } from "./AntimonyParser";
import { UnitFormulaContext } from "./AntimonyParser";
import { ModelCallContext } from "./AntimonyParser";


/**
 * This interface defines a complete generic visitor for a parse tree produced
 * by `AntimonyParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export interface AntimonyVisitor<Result> extends ParseTreeVisitor<Result> {
	/**
	 * Visit a parse tree produced by the `unitGroup`
	 * labeled alternative in `AntimonyParser.unitFormula`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitUnitGroup?: (ctx: UnitGroupContext) => Result;

	/**
	 * Visit a parse tree produced by the `unitNumber`
	 * labeled alternative in `AntimonyParser.unitFormula`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitUnitNumber?: (ctx: UnitNumberContext) => Result;

	/**
	 * Visit a parse tree produced by the `unitName`
	 * labeled alternative in `AntimonyParser.unitFormula`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitUnitName?: (ctx: UnitNameContext) => Result;

	/**
	 * Visit a parse tree produced by the `unitPositive`
	 * labeled alternative in `AntimonyParser.unitFormula`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitUnitPositive?: (ctx: UnitPositiveContext) => Result;

	/**
	 * Visit a parse tree produced by the `unitNegative`
	 * labeled alternative in `AntimonyParser.unitFormula`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitUnitNegative?: (ctx: UnitNegativeContext) => Result;

	/**
	 * Visit a parse tree produced by the `unitPower`
	 * labeled alternative in `AntimonyParser.unitFormula`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitUnitPower?: (ctx: UnitPowerContext) => Result;

	/**
	 * Visit a parse tree produced by the `unitProduct`
	 * labeled alternative in `AntimonyParser.unitFormula`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitUnitProduct?: (ctx: UnitProductContext) => Result;

	/**
	 * Visit a parse tree produced by the `unitSum`
	 * labeled alternative in `AntimonyParser.unitFormula`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitUnitSum?: (ctx: UnitSumContext) => Result;

	/**
	 * Visit a parse tree produced by the `declarationAssignment`
	 * labeled alternative in `AntimonyParser.declarationTerm`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitDeclarationAssignment?: (ctx: DeclarationAssignmentContext) => Result;

	/**
	 * Visit a parse tree produced by the `declarationName`
	 * labeled alternative in `AntimonyParser.declarationTerm`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitDeclarationName?: (ctx: DeclarationNameContext) => Result;

	/**
	 * Visit a parse tree produced by the `name`
	 * labeled alternative in `AntimonyParser.variable`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitName?: (ctx: NameContext) => Result;

	/**
	 * Visit a parse tree produced by the `subvariable`
	 * labeled alternative in `AntimonyParser.variable`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitSubvariable?: (ctx: SubvariableContext) => Result;

	/**
	 * Visit a parse tree produced by the `constant`
	 * labeled alternative in `AntimonyParser.variable`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitConstant?: (ctx: ConstantContext) => Result;

	/**
	 * Visit a parse tree produced by the `group`
	 * labeled alternative in `AntimonyParser.formula`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitGroup?: (ctx: GroupContext) => Result;

	/**
	 * Visit a parse tree produced by the `number`
	 * labeled alternative in `AntimonyParser.formula`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitNumber?: (ctx: NumberContext) => Result;

	/**
	 * Visit a parse tree produced by the `call`
	 * labeled alternative in `AntimonyParser.formula`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitCall?: (ctx: CallContext) => Result;

	/**
	 * Visit a parse tree produced by the `var`
	 * labeled alternative in `AntimonyParser.formula`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitVar?: (ctx: VarContext) => Result;

	/**
	 * Visit a parse tree produced by the `positive`
	 * labeled alternative in `AntimonyParser.formula`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitPositive?: (ctx: PositiveContext) => Result;

	/**
	 * Visit a parse tree produced by the `negative`
	 * labeled alternative in `AntimonyParser.formula`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitNegative?: (ctx: NegativeContext) => Result;

	/**
	 * Visit a parse tree produced by the `power`
	 * labeled alternative in `AntimonyParser.formula`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitPower?: (ctx: PowerContext) => Result;

	/**
	 * Visit a parse tree produced by the `product`
	 * labeled alternative in `AntimonyParser.formula`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitProduct?: (ctx: ProductContext) => Result;

	/**
	 * Visit a parse tree produced by the `sum`
	 * labeled alternative in `AntimonyParser.formula`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitSum?: (ctx: SumContext) => Result;

	/**
	 * Visit a parse tree produced by the `compare`
	 * labeled alternative in `AntimonyParser.formula`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitCompare?: (ctx: CompareContext) => Result;

	/**
	 * Visit a parse tree produced by the `logical`
	 * labeled alternative in `AntimonyParser.formula`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitLogical?: (ctx: LogicalContext) => Result;

	/**
	 * Visit a parse tree produced by the `annotationName`
	 * labeled alternative in `AntimonyParser.annotationItem`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitAnnotationName?: (ctx: AnnotationNameContext) => Result;

	/**
	 * Visit a parse tree produced by the `annotationSubItem`
	 * labeled alternative in `AntimonyParser.annotationItem`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitAnnotationSubItem?: (ctx: AnnotationSubItemContext) => Result;

	/**
	 * Visit a parse tree produced by `AntimonyParser.root`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitRoot?: (ctx: RootContext) => Result;

	/**
	 * Visit a parse tree produced by `AntimonyParser.statementSeparator`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitStatementSeparator?: (ctx: StatementSeparatorContext) => Result;

	/**
	 * Visit a parse tree produced by `AntimonyParser.topLevelStatement`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTopLevelStatement?: (ctx: TopLevelStatementContext) => Result;

	/**
	 * Visit a parse tree produced by `AntimonyParser.statementList`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitStatementList?: (ctx: StatementListContext) => Result;

	/**
	 * Visit a parse tree produced by `AntimonyParser.statement`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitStatement?: (ctx: StatementContext) => Result;

	/**
	 * Visit a parse tree produced by `AntimonyParser.model`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitModel?: (ctx: ModelContext) => Result;

	/**
	 * Visit a parse tree produced by `AntimonyParser.exportList`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitExportList?: (ctx: ExportListContext) => Result;

	/**
	 * Visit a parse tree produced by `AntimonyParser.formula`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitFormula?: (ctx: FormulaContext) => Result;

	/**
	 * Visit a parse tree produced by `AntimonyParser.functionCall`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitFunctionCall?: (ctx: FunctionCallContext) => Result;

	/**
	 * Visit a parse tree produced by `AntimonyParser.parameterList`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitParameterList?: (ctx: ParameterListContext) => Result;

	/**
	 * Visit a parse tree produced by `AntimonyParser.variable`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitVariable?: (ctx: VariableContext) => Result;

	/**
	 * Visit a parse tree produced by `AntimonyParser.inCompartment`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitInCompartment?: (ctx: InCompartmentContext) => Result;

	/**
	 * Visit a parse tree produced by `AntimonyParser.reaction`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitReaction?: (ctx: ReactionContext) => Result;

	/**
	 * Visit a parse tree produced by `AntimonyParser.reactionName`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitReactionName?: (ctx: ReactionNameContext) => Result;

	/**
	 * Visit a parse tree produced by `AntimonyParser.reactionFormula`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitReactionFormula?: (ctx: ReactionFormulaContext) => Result;

	/**
	 * Visit a parse tree produced by `AntimonyParser.reactantList`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitReactantList?: (ctx: ReactantListContext) => Result;

	/**
	 * Visit a parse tree produced by `AntimonyParser.reactant`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitReactant?: (ctx: ReactantContext) => Result;

	/**
	 * Visit a parse tree produced by `AntimonyParser.assignment`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitAssignment?: (ctx: AssignmentContext) => Result;

	/**
	 * Visit a parse tree produced by `AntimonyParser.declaration`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitDeclaration?: (ctx: DeclarationContext) => Result;

	/**
	 * Visit a parse tree produced by `AntimonyParser.declarationTerm`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitDeclarationTerm?: (ctx: DeclarationTermContext) => Result;

	/**
	 * Visit a parse tree produced by `AntimonyParser.event`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitEvent?: (ctx: EventContext) => Result;

	/**
	 * Visit a parse tree produced by `AntimonyParser.eventName`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitEventName?: (ctx: EventNameContext) => Result;

	/**
	 * Visit a parse tree produced by `AntimonyParser.eventOptions`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitEventOptions?: (ctx: EventOptionsContext) => Result;

	/**
	 * Visit a parse tree produced by `AntimonyParser.eventOption`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitEventOption?: (ctx: EventOptionContext) => Result;

	/**
	 * Visit a parse tree produced by `AntimonyParser.eventAssignments`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitEventAssignments?: (ctx: EventAssignmentsContext) => Result;

	/**
	 * Visit a parse tree produced by `AntimonyParser.eventAssignment`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitEventAssignment?: (ctx: EventAssignmentContext) => Result;

	/**
	 * Visit a parse tree produced by `AntimonyParser.annotation`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitAnnotation?: (ctx: AnnotationContext) => Result;

	/**
	 * Visit a parse tree produced by `AntimonyParser.variableAnnotation`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitVariableAnnotation?: (ctx: VariableAnnotationContext) => Result;

	/**
	 * Visit a parse tree produced by `AntimonyParser.hasAnnotation`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitHasAnnotation?: (ctx: HasAnnotationContext) => Result;

	/**
	 * Visit a parse tree produced by `AntimonyParser.modelAnnotation`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitModelAnnotation?: (ctx: ModelAnnotationContext) => Result;

	/**
	 * Visit a parse tree produced by `AntimonyParser.annotationBody`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitAnnotationBody?: (ctx: AnnotationBodyContext) => Result;

	/**
	 * Visit a parse tree produced by `AntimonyParser.annotationItem`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitAnnotationItem?: (ctx: AnnotationItemContext) => Result;

	/**
	 * Visit a parse tree produced by `AntimonyParser.string`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitString?: (ctx: StringContext) => Result;

	/**
	 * Visit a parse tree produced by `AntimonyParser.unitDeclaration`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitUnitDeclaration?: (ctx: UnitDeclarationContext) => Result;

	/**
	 * Visit a parse tree produced by `AntimonyParser.unitFormula`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitUnitFormula?: (ctx: UnitFormulaContext) => Result;

	/**
	 * Visit a parse tree produced by `AntimonyParser.modelCall`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitModelCall?: (ctx: ModelCallContext) => Result;
}

