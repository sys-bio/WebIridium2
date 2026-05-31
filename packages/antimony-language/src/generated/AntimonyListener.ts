// @ts-nocheck
// Generated from ./src/grammar/Antimony.g4 by ANTLR 4.9.0-SNAPSHOT


import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";

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
import { PowerContext } from "./AntimonyParser";
import { PositiveContext } from "./AntimonyParser";
import { NegativeContext } from "./AntimonyParser";
import { NotContext } from "./AntimonyParser";
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
import { ArgumentListContext } from "./AntimonyParser";
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
 * This interface defines a complete listener for a parse tree produced by
 * `AntimonyParser`.
 */
export interface AntimonyListener extends ParseTreeListener {
	/**
	 * Enter a parse tree produced by the `unitGroup`
	 * labeled alternative in `AntimonyParser.unitFormula`.
	 * @param ctx the parse tree
	 */
	enterUnitGroup?: (ctx: UnitGroupContext) => void;
	/**
	 * Exit a parse tree produced by the `unitGroup`
	 * labeled alternative in `AntimonyParser.unitFormula`.
	 * @param ctx the parse tree
	 */
	exitUnitGroup?: (ctx: UnitGroupContext) => void;

	/**
	 * Enter a parse tree produced by the `unitNumber`
	 * labeled alternative in `AntimonyParser.unitFormula`.
	 * @param ctx the parse tree
	 */
	enterUnitNumber?: (ctx: UnitNumberContext) => void;
	/**
	 * Exit a parse tree produced by the `unitNumber`
	 * labeled alternative in `AntimonyParser.unitFormula`.
	 * @param ctx the parse tree
	 */
	exitUnitNumber?: (ctx: UnitNumberContext) => void;

	/**
	 * Enter a parse tree produced by the `unitName`
	 * labeled alternative in `AntimonyParser.unitFormula`.
	 * @param ctx the parse tree
	 */
	enterUnitName?: (ctx: UnitNameContext) => void;
	/**
	 * Exit a parse tree produced by the `unitName`
	 * labeled alternative in `AntimonyParser.unitFormula`.
	 * @param ctx the parse tree
	 */
	exitUnitName?: (ctx: UnitNameContext) => void;

	/**
	 * Enter a parse tree produced by the `unitPositive`
	 * labeled alternative in `AntimonyParser.unitFormula`.
	 * @param ctx the parse tree
	 */
	enterUnitPositive?: (ctx: UnitPositiveContext) => void;
	/**
	 * Exit a parse tree produced by the `unitPositive`
	 * labeled alternative in `AntimonyParser.unitFormula`.
	 * @param ctx the parse tree
	 */
	exitUnitPositive?: (ctx: UnitPositiveContext) => void;

	/**
	 * Enter a parse tree produced by the `unitNegative`
	 * labeled alternative in `AntimonyParser.unitFormula`.
	 * @param ctx the parse tree
	 */
	enterUnitNegative?: (ctx: UnitNegativeContext) => void;
	/**
	 * Exit a parse tree produced by the `unitNegative`
	 * labeled alternative in `AntimonyParser.unitFormula`.
	 * @param ctx the parse tree
	 */
	exitUnitNegative?: (ctx: UnitNegativeContext) => void;

	/**
	 * Enter a parse tree produced by the `unitPower`
	 * labeled alternative in `AntimonyParser.unitFormula`.
	 * @param ctx the parse tree
	 */
	enterUnitPower?: (ctx: UnitPowerContext) => void;
	/**
	 * Exit a parse tree produced by the `unitPower`
	 * labeled alternative in `AntimonyParser.unitFormula`.
	 * @param ctx the parse tree
	 */
	exitUnitPower?: (ctx: UnitPowerContext) => void;

	/**
	 * Enter a parse tree produced by the `unitProduct`
	 * labeled alternative in `AntimonyParser.unitFormula`.
	 * @param ctx the parse tree
	 */
	enterUnitProduct?: (ctx: UnitProductContext) => void;
	/**
	 * Exit a parse tree produced by the `unitProduct`
	 * labeled alternative in `AntimonyParser.unitFormula`.
	 * @param ctx the parse tree
	 */
	exitUnitProduct?: (ctx: UnitProductContext) => void;

	/**
	 * Enter a parse tree produced by the `unitSum`
	 * labeled alternative in `AntimonyParser.unitFormula`.
	 * @param ctx the parse tree
	 */
	enterUnitSum?: (ctx: UnitSumContext) => void;
	/**
	 * Exit a parse tree produced by the `unitSum`
	 * labeled alternative in `AntimonyParser.unitFormula`.
	 * @param ctx the parse tree
	 */
	exitUnitSum?: (ctx: UnitSumContext) => void;

	/**
	 * Enter a parse tree produced by the `declarationAssignment`
	 * labeled alternative in `AntimonyParser.declarationTerm`.
	 * @param ctx the parse tree
	 */
	enterDeclarationAssignment?: (ctx: DeclarationAssignmentContext) => void;
	/**
	 * Exit a parse tree produced by the `declarationAssignment`
	 * labeled alternative in `AntimonyParser.declarationTerm`.
	 * @param ctx the parse tree
	 */
	exitDeclarationAssignment?: (ctx: DeclarationAssignmentContext) => void;

	/**
	 * Enter a parse tree produced by the `declarationName`
	 * labeled alternative in `AntimonyParser.declarationTerm`.
	 * @param ctx the parse tree
	 */
	enterDeclarationName?: (ctx: DeclarationNameContext) => void;
	/**
	 * Exit a parse tree produced by the `declarationName`
	 * labeled alternative in `AntimonyParser.declarationTerm`.
	 * @param ctx the parse tree
	 */
	exitDeclarationName?: (ctx: DeclarationNameContext) => void;

	/**
	 * Enter a parse tree produced by the `name`
	 * labeled alternative in `AntimonyParser.variable`.
	 * @param ctx the parse tree
	 */
	enterName?: (ctx: NameContext) => void;
	/**
	 * Exit a parse tree produced by the `name`
	 * labeled alternative in `AntimonyParser.variable`.
	 * @param ctx the parse tree
	 */
	exitName?: (ctx: NameContext) => void;

	/**
	 * Enter a parse tree produced by the `subvariable`
	 * labeled alternative in `AntimonyParser.variable`.
	 * @param ctx the parse tree
	 */
	enterSubvariable?: (ctx: SubvariableContext) => void;
	/**
	 * Exit a parse tree produced by the `subvariable`
	 * labeled alternative in `AntimonyParser.variable`.
	 * @param ctx the parse tree
	 */
	exitSubvariable?: (ctx: SubvariableContext) => void;

	/**
	 * Enter a parse tree produced by the `constant`
	 * labeled alternative in `AntimonyParser.variable`.
	 * @param ctx the parse tree
	 */
	enterConstant?: (ctx: ConstantContext) => void;
	/**
	 * Exit a parse tree produced by the `constant`
	 * labeled alternative in `AntimonyParser.variable`.
	 * @param ctx the parse tree
	 */
	exitConstant?: (ctx: ConstantContext) => void;

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
	 * Enter a parse tree produced by the `not`
	 * labeled alternative in `AntimonyParser.formula`.
	 * @param ctx the parse tree
	 */
	enterNot?: (ctx: NotContext) => void;
	/**
	 * Exit a parse tree produced by the `not`
	 * labeled alternative in `AntimonyParser.formula`.
	 * @param ctx the parse tree
	 */
	exitNot?: (ctx: NotContext) => void;

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
	 * Enter a parse tree produced by the `annotationName`
	 * labeled alternative in `AntimonyParser.annotationItem`.
	 * @param ctx the parse tree
	 */
	enterAnnotationName?: (ctx: AnnotationNameContext) => void;
	/**
	 * Exit a parse tree produced by the `annotationName`
	 * labeled alternative in `AntimonyParser.annotationItem`.
	 * @param ctx the parse tree
	 */
	exitAnnotationName?: (ctx: AnnotationNameContext) => void;

	/**
	 * Enter a parse tree produced by the `annotationSubItem`
	 * labeled alternative in `AntimonyParser.annotationItem`.
	 * @param ctx the parse tree
	 */
	enterAnnotationSubItem?: (ctx: AnnotationSubItemContext) => void;
	/**
	 * Exit a parse tree produced by the `annotationSubItem`
	 * labeled alternative in `AntimonyParser.annotationItem`.
	 * @param ctx the parse tree
	 */
	exitAnnotationSubItem?: (ctx: AnnotationSubItemContext) => void;

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
	 * Enter a parse tree produced by `AntimonyParser.argumentList`.
	 * @param ctx the parse tree
	 */
	enterArgumentList?: (ctx: ArgumentListContext) => void;
	/**
	 * Exit a parse tree produced by `AntimonyParser.argumentList`.
	 * @param ctx the parse tree
	 */
	exitArgumentList?: (ctx: ArgumentListContext) => void;

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
	 * Enter a parse tree produced by `AntimonyParser.inCompartment`.
	 * @param ctx the parse tree
	 */
	enterInCompartment?: (ctx: InCompartmentContext) => void;
	/**
	 * Exit a parse tree produced by `AntimonyParser.inCompartment`.
	 * @param ctx the parse tree
	 */
	exitInCompartment?: (ctx: InCompartmentContext) => void;

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
	 * Enter a parse tree produced by `AntimonyParser.declaration`.
	 * @param ctx the parse tree
	 */
	enterDeclaration?: (ctx: DeclarationContext) => void;
	/**
	 * Exit a parse tree produced by `AntimonyParser.declaration`.
	 * @param ctx the parse tree
	 */
	exitDeclaration?: (ctx: DeclarationContext) => void;

	/**
	 * Enter a parse tree produced by `AntimonyParser.declarationTerm`.
	 * @param ctx the parse tree
	 */
	enterDeclarationTerm?: (ctx: DeclarationTermContext) => void;
	/**
	 * Exit a parse tree produced by `AntimonyParser.declarationTerm`.
	 * @param ctx the parse tree
	 */
	exitDeclarationTerm?: (ctx: DeclarationTermContext) => void;

	/**
	 * Enter a parse tree produced by `AntimonyParser.event`.
	 * @param ctx the parse tree
	 */
	enterEvent?: (ctx: EventContext) => void;
	/**
	 * Exit a parse tree produced by `AntimonyParser.event`.
	 * @param ctx the parse tree
	 */
	exitEvent?: (ctx: EventContext) => void;

	/**
	 * Enter a parse tree produced by `AntimonyParser.eventName`.
	 * @param ctx the parse tree
	 */
	enterEventName?: (ctx: EventNameContext) => void;
	/**
	 * Exit a parse tree produced by `AntimonyParser.eventName`.
	 * @param ctx the parse tree
	 */
	exitEventName?: (ctx: EventNameContext) => void;

	/**
	 * Enter a parse tree produced by `AntimonyParser.eventOptions`.
	 * @param ctx the parse tree
	 */
	enterEventOptions?: (ctx: EventOptionsContext) => void;
	/**
	 * Exit a parse tree produced by `AntimonyParser.eventOptions`.
	 * @param ctx the parse tree
	 */
	exitEventOptions?: (ctx: EventOptionsContext) => void;

	/**
	 * Enter a parse tree produced by `AntimonyParser.eventOption`.
	 * @param ctx the parse tree
	 */
	enterEventOption?: (ctx: EventOptionContext) => void;
	/**
	 * Exit a parse tree produced by `AntimonyParser.eventOption`.
	 * @param ctx the parse tree
	 */
	exitEventOption?: (ctx: EventOptionContext) => void;

	/**
	 * Enter a parse tree produced by `AntimonyParser.eventAssignments`.
	 * @param ctx the parse tree
	 */
	enterEventAssignments?: (ctx: EventAssignmentsContext) => void;
	/**
	 * Exit a parse tree produced by `AntimonyParser.eventAssignments`.
	 * @param ctx the parse tree
	 */
	exitEventAssignments?: (ctx: EventAssignmentsContext) => void;

	/**
	 * Enter a parse tree produced by `AntimonyParser.eventAssignment`.
	 * @param ctx the parse tree
	 */
	enterEventAssignment?: (ctx: EventAssignmentContext) => void;
	/**
	 * Exit a parse tree produced by `AntimonyParser.eventAssignment`.
	 * @param ctx the parse tree
	 */
	exitEventAssignment?: (ctx: EventAssignmentContext) => void;

	/**
	 * Enter a parse tree produced by `AntimonyParser.annotation`.
	 * @param ctx the parse tree
	 */
	enterAnnotation?: (ctx: AnnotationContext) => void;
	/**
	 * Exit a parse tree produced by `AntimonyParser.annotation`.
	 * @param ctx the parse tree
	 */
	exitAnnotation?: (ctx: AnnotationContext) => void;

	/**
	 * Enter a parse tree produced by `AntimonyParser.variableAnnotation`.
	 * @param ctx the parse tree
	 */
	enterVariableAnnotation?: (ctx: VariableAnnotationContext) => void;
	/**
	 * Exit a parse tree produced by `AntimonyParser.variableAnnotation`.
	 * @param ctx the parse tree
	 */
	exitVariableAnnotation?: (ctx: VariableAnnotationContext) => void;

	/**
	 * Enter a parse tree produced by `AntimonyParser.hasAnnotation`.
	 * @param ctx the parse tree
	 */
	enterHasAnnotation?: (ctx: HasAnnotationContext) => void;
	/**
	 * Exit a parse tree produced by `AntimonyParser.hasAnnotation`.
	 * @param ctx the parse tree
	 */
	exitHasAnnotation?: (ctx: HasAnnotationContext) => void;

	/**
	 * Enter a parse tree produced by `AntimonyParser.modelAnnotation`.
	 * @param ctx the parse tree
	 */
	enterModelAnnotation?: (ctx: ModelAnnotationContext) => void;
	/**
	 * Exit a parse tree produced by `AntimonyParser.modelAnnotation`.
	 * @param ctx the parse tree
	 */
	exitModelAnnotation?: (ctx: ModelAnnotationContext) => void;

	/**
	 * Enter a parse tree produced by `AntimonyParser.annotationBody`.
	 * @param ctx the parse tree
	 */
	enterAnnotationBody?: (ctx: AnnotationBodyContext) => void;
	/**
	 * Exit a parse tree produced by `AntimonyParser.annotationBody`.
	 * @param ctx the parse tree
	 */
	exitAnnotationBody?: (ctx: AnnotationBodyContext) => void;

	/**
	 * Enter a parse tree produced by `AntimonyParser.annotationItem`.
	 * @param ctx the parse tree
	 */
	enterAnnotationItem?: (ctx: AnnotationItemContext) => void;
	/**
	 * Exit a parse tree produced by `AntimonyParser.annotationItem`.
	 * @param ctx the parse tree
	 */
	exitAnnotationItem?: (ctx: AnnotationItemContext) => void;

	/**
	 * Enter a parse tree produced by `AntimonyParser.string`.
	 * @param ctx the parse tree
	 */
	enterString?: (ctx: StringContext) => void;
	/**
	 * Exit a parse tree produced by `AntimonyParser.string`.
	 * @param ctx the parse tree
	 */
	exitString?: (ctx: StringContext) => void;

	/**
	 * Enter a parse tree produced by `AntimonyParser.unitDeclaration`.
	 * @param ctx the parse tree
	 */
	enterUnitDeclaration?: (ctx: UnitDeclarationContext) => void;
	/**
	 * Exit a parse tree produced by `AntimonyParser.unitDeclaration`.
	 * @param ctx the parse tree
	 */
	exitUnitDeclaration?: (ctx: UnitDeclarationContext) => void;

	/**
	 * Enter a parse tree produced by `AntimonyParser.unitFormula`.
	 * @param ctx the parse tree
	 */
	enterUnitFormula?: (ctx: UnitFormulaContext) => void;
	/**
	 * Exit a parse tree produced by `AntimonyParser.unitFormula`.
	 * @param ctx the parse tree
	 */
	exitUnitFormula?: (ctx: UnitFormulaContext) => void;

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

