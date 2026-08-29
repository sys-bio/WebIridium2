// @ts-nocheck
// @ts-nocheck
// Generated from ./src/grammar/Antimony.g4 by ANTLR 4.9.0-SNAPSHOT


import { ATN } from "antlr4ts/atn/ATN";
import { ATNDeserializer } from "antlr4ts/atn/ATNDeserializer";
import { FailedPredicateException } from "antlr4ts/FailedPredicateException";
import { NotNull } from "antlr4ts/Decorators";
import { NoViableAltException } from "antlr4ts/NoViableAltException";
import { Override } from "antlr4ts/Decorators";
import { Parser } from "antlr4ts/Parser";
import { ParserRuleContext } from "antlr4ts/ParserRuleContext";
import { ParserATNSimulator } from "antlr4ts/atn/ParserATNSimulator";
import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";
import { ParseTreeVisitor } from "antlr4ts/tree/ParseTreeVisitor";
import { RecognitionException } from "antlr4ts/RecognitionException";
import { RuleContext } from "antlr4ts/RuleContext";
//import { RuleVersion } from "antlr4ts/RuleVersion";
import { TerminalNode } from "antlr4ts/tree/TerminalNode";
import { Token } from "antlr4ts/Token";
import { TokenStream } from "antlr4ts/TokenStream";
import { Vocabulary } from "antlr4ts/Vocabulary";
import { VocabularyImpl } from "antlr4ts/VocabularyImpl";

import * as Utils from "antlr4ts/misc/Utils";

import { AntimonyListener } from "./AntimonyListener";
import { AntimonyVisitor } from "./AntimonyVisitor";


export class AntimonyParser extends Parser {
	public static readonly T__0 = 1;
	public static readonly T__1 = 2;
	public static readonly T__2 = 3;
	public static readonly T__3 = 4;
	public static readonly T__4 = 5;
	public static readonly T__5 = 6;
	public static readonly T__6 = 7;
	public static readonly T__7 = 8;
	public static readonly T__8 = 9;
	public static readonly T__9 = 10;
	public static readonly T__10 = 11;
	public static readonly T__11 = 12;
	public static readonly T__12 = 13;
	public static readonly T__13 = 14;
	public static readonly T__14 = 15;
	public static readonly T__15 = 16;
	public static readonly MODEL = 17;
	public static readonly FUNCTION = 18;
	public static readonly END = 19;
	public static readonly IN = 20;
	public static readonly IS = 21;
	public static readonly AT = 22;
	public static readonly AFTER = 23;
	public static readonly UNIT = 24;
	public static readonly HAS = 25;
	public static readonly SUBS_ONLY = 26;
	public static readonly DELETE = 27;
	public static readonly CONST_MODIFIER = 28;
	public static readonly DECL_WORD = 29;
	public static readonly NAME = 30;
	public static readonly NUMBER = 31;
	public static readonly ARROW = 32;
	public static readonly INTERACTION = 33;
	public static readonly DASHES = 34;
	public static readonly COMPARE = 35;
	public static readonly LOGICAL = 36;
	public static readonly STRING = 37;
	public static readonly LONG_STRING = 38;
	public static readonly NEWLINE = 39;
	public static readonly WHITESPACE = 40;
	public static readonly COMMENT = 41;
	public static readonly LINE_COMMENT = 42;
	public static readonly RULE_root = 0;
	public static readonly RULE_statementSeparator = 1;
	public static readonly RULE_topLevelStatement = 2;
	public static readonly RULE_statementList = 3;
	public static readonly RULE_statement = 4;
	public static readonly RULE_model = 5;
	public static readonly RULE_exportList = 6;
	public static readonly RULE_functionDefinition = 7;
	public static readonly RULE_parameterList = 8;
	public static readonly RULE_formula = 9;
	public static readonly RULE_functionCall = 10;
	public static readonly RULE_argumentList = 11;
	public static readonly RULE_variable = 12;
	public static readonly RULE_inCompartment = 13;
	public static readonly RULE_nameLabel = 14;
	public static readonly RULE_reaction = 15;
	public static readonly RULE_reactionFormula = 16;
	public static readonly RULE_reactantList = 17;
	public static readonly RULE_reactant = 18;
	public static readonly RULE_stoichiometry = 19;
	public static readonly RULE_assignment = 20;
	public static readonly RULE_declaration = 21;
	public static readonly RULE_declarationHead = 22;
	public static readonly RULE_declarationTerm = 23;
	public static readonly RULE_event = 24;
	public static readonly RULE_eventOptions = 25;
	public static readonly RULE_eventOption = 26;
	public static readonly RULE_eventAssignments = 27;
	public static readonly RULE_eventAssignment = 28;
	public static readonly RULE_rename = 29;
	public static readonly RULE_delete = 30;
	public static readonly RULE_annotation = 31;
	public static readonly RULE_variableAnnotation = 32;
	public static readonly RULE_hasAnnotation = 33;
	public static readonly RULE_modelAnnotation = 34;
	public static readonly RULE_annotationBody = 35;
	public static readonly RULE_annotationItem = 36;
	public static readonly RULE_string = 37;
	public static readonly RULE_unitDeclaration = 38;
	public static readonly RULE_unitFormula = 39;
	public static readonly RULE_inStatement = 40;
	public static readonly RULE_modelImport = 41;
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"root", "statementSeparator", "topLevelStatement", "statementList", "statement", 
		"model", "exportList", "functionDefinition", "parameterList", "formula", 
		"functionCall", "argumentList", "variable", "inCompartment", "nameLabel", 
		"reaction", "reactionFormula", "reactantList", "reactant", "stoichiometry", 
		"assignment", "declaration", "declarationHead", "declarationTerm", "event", 
		"eventOptions", "eventOption", "eventAssignments", "eventAssignment", 
		"rename", "delete", "annotation", "variableAnnotation", "hasAnnotation", 
		"modelAnnotation", "annotationBody", "annotationItem", "string", "unitDeclaration", 
		"unitFormula", "inStatement", "modelImport",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
		undefined, "';'", "'*'", "'('", "','", "')'", "'^'", "'+'", "'-'", "'!'", 
		"'/'", "'%'", "'.'", "'$'", "':'", "'''", "'='", undefined, "'function'", 
		"'end'", "'in'", "'is'", "'at'", "'after'", "'unit'", "'has'", "'substanceOnly'", 
		"'delete'", undefined, undefined, undefined, undefined, undefined, undefined, 
		"'--'",
	];
	private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, "MODEL", "FUNCTION", "END", "IN", "IS", 
		"AT", "AFTER", "UNIT", "HAS", "SUBS_ONLY", "DELETE", "CONST_MODIFIER", 
		"DECL_WORD", "NAME", "NUMBER", "ARROW", "INTERACTION", "DASHES", "COMPARE", 
		"LOGICAL", "STRING", "LONG_STRING", "NEWLINE", "WHITESPACE", "COMMENT", 
		"LINE_COMMENT",
	];
	public static readonly VOCABULARY: Vocabulary = new VocabularyImpl(AntimonyParser._LITERAL_NAMES, AntimonyParser._SYMBOLIC_NAMES, []);

	// @Override
	// @NotNull
	public get vocabulary(): Vocabulary {
		return AntimonyParser.VOCABULARY;
	}
	// tslint:enable:no-trailing-whitespace

	// @Override
	public get grammarFileName(): string { return "Antimony.g4"; }

	// @Override
	public get ruleNames(): string[] { return AntimonyParser.ruleNames; }

	// @Override
	public get serializedATN(): string { return AntimonyParser._serializedATN; }

	protected createFailedPredicateException(predicate?: string, message?: string): FailedPredicateException {
		return new FailedPredicateException(this, predicate, message);
	}

	constructor(input: TokenStream) {
		super(input);
		this._interp = new ParserATNSimulator(AntimonyParser._ATN, this);
	}
	// @RuleVersion(0)
	public root(): RootContext {
		let _localctx: RootContext = new RootContext(this._ctx, this.state);
		this.enterRule(_localctx, 0, AntimonyParser.RULE_root);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 85;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (((((_la - 8)) & ~0x1F) === 0 && ((1 << (_la - 8)) & ((1 << (AntimonyParser.T__7 - 8)) | (1 << (AntimonyParser.T__12 - 8)) | (1 << (AntimonyParser.MODEL - 8)) | (1 << (AntimonyParser.FUNCTION - 8)) | (1 << (AntimonyParser.AT - 8)) | (1 << (AntimonyParser.UNIT - 8)) | (1 << (AntimonyParser.SUBS_ONLY - 8)) | (1 << (AntimonyParser.DELETE - 8)) | (1 << (AntimonyParser.CONST_MODIFIER - 8)) | (1 << (AntimonyParser.DECL_WORD - 8)) | (1 << (AntimonyParser.NAME - 8)) | (1 << (AntimonyParser.NUMBER - 8)) | (1 << (AntimonyParser.ARROW - 8)))) !== 0)) {
				{
				this.state = 84;
				this.topLevelStatement();
				}
			}

			this.state = 93;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === AntimonyParser.T__0 || _la === AntimonyParser.NEWLINE) {
				{
				{
				this.state = 87;
				this.statementSeparator();
				this.state = 89;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (((((_la - 8)) & ~0x1F) === 0 && ((1 << (_la - 8)) & ((1 << (AntimonyParser.T__7 - 8)) | (1 << (AntimonyParser.T__12 - 8)) | (1 << (AntimonyParser.MODEL - 8)) | (1 << (AntimonyParser.FUNCTION - 8)) | (1 << (AntimonyParser.AT - 8)) | (1 << (AntimonyParser.UNIT - 8)) | (1 << (AntimonyParser.SUBS_ONLY - 8)) | (1 << (AntimonyParser.DELETE - 8)) | (1 << (AntimonyParser.CONST_MODIFIER - 8)) | (1 << (AntimonyParser.DECL_WORD - 8)) | (1 << (AntimonyParser.NAME - 8)) | (1 << (AntimonyParser.NUMBER - 8)) | (1 << (AntimonyParser.ARROW - 8)))) !== 0)) {
					{
					this.state = 88;
					this.topLevelStatement();
					}
				}

				}
				}
				this.state = 95;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 96;
			this.match(AntimonyParser.EOF);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public statementSeparator(): StatementSeparatorContext {
		let _localctx: StatementSeparatorContext = new StatementSeparatorContext(this._ctx, this.state);
		this.enterRule(_localctx, 2, AntimonyParser.RULE_statementSeparator);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 98;
			_la = this._input.LA(1);
			if (!(_la === AntimonyParser.T__0 || _la === AntimonyParser.NEWLINE)) {
			this._errHandler.recoverInline(this);
			} else {
				if (this._input.LA(1) === Token.EOF) {
					this.matchedEOF = true;
				}

				this._errHandler.reportMatch(this);
				this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public topLevelStatement(): TopLevelStatementContext {
		let _localctx: TopLevelStatementContext = new TopLevelStatementContext(this._ctx, this.state);
		this.enterRule(_localctx, 4, AntimonyParser.RULE_topLevelStatement);
		try {
			this.state = 103;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 3, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 100;
				this.model();
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 101;
				this.functionDefinition();
				}
				break;

			case 3:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 102;
				this.statement();
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public statementList(): StatementListContext {
		let _localctx: StatementListContext = new StatementListContext(this._ctx, this.state);
		this.enterRule(_localctx, 6, AntimonyParser.RULE_statementList);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 109;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			do {
				{
				{
				this.state = 106;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (((((_la - 8)) & ~0x1F) === 0 && ((1 << (_la - 8)) & ((1 << (AntimonyParser.T__7 - 8)) | (1 << (AntimonyParser.T__12 - 8)) | (1 << (AntimonyParser.MODEL - 8)) | (1 << (AntimonyParser.AT - 8)) | (1 << (AntimonyParser.UNIT - 8)) | (1 << (AntimonyParser.SUBS_ONLY - 8)) | (1 << (AntimonyParser.DELETE - 8)) | (1 << (AntimonyParser.CONST_MODIFIER - 8)) | (1 << (AntimonyParser.DECL_WORD - 8)) | (1 << (AntimonyParser.NAME - 8)) | (1 << (AntimonyParser.NUMBER - 8)) | (1 << (AntimonyParser.ARROW - 8)))) !== 0)) {
					{
					this.state = 105;
					this.statement();
					}
				}

				this.state = 108;
				this.statementSeparator();
				}
				}
				this.state = 111;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			} while ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << AntimonyParser.T__0) | (1 << AntimonyParser.T__7) | (1 << AntimonyParser.T__12) | (1 << AntimonyParser.MODEL) | (1 << AntimonyParser.AT) | (1 << AntimonyParser.UNIT) | (1 << AntimonyParser.SUBS_ONLY) | (1 << AntimonyParser.DELETE) | (1 << AntimonyParser.CONST_MODIFIER) | (1 << AntimonyParser.DECL_WORD) | (1 << AntimonyParser.NAME) | (1 << AntimonyParser.NUMBER))) !== 0) || _la === AntimonyParser.ARROW || _la === AntimonyParser.NEWLINE);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public statement(): StatementContext {
		let _localctx: StatementContext = new StatementContext(this._ctx, this.state);
		this.enterRule(_localctx, 8, AntimonyParser.RULE_statement);
		try {
			this.state = 123;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 6, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 113;
				this.reaction();
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 114;
				this.assignment();
				}
				break;

			case 3:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 115;
				this.declaration();
				}
				break;

			case 4:
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 116;
				this.modelImport();
				}
				break;

			case 5:
				this.enterOuterAlt(_localctx, 5);
				{
				this.state = 117;
				this.event();
				}
				break;

			case 6:
				this.enterOuterAlt(_localctx, 6);
				{
				this.state = 118;
				this.annotation();
				}
				break;

			case 7:
				this.enterOuterAlt(_localctx, 7);
				{
				this.state = 119;
				this.unitDeclaration();
				}
				break;

			case 8:
				this.enterOuterAlt(_localctx, 8);
				{
				this.state = 120;
				this.inStatement();
				}
				break;

			case 9:
				this.enterOuterAlt(_localctx, 9);
				{
				this.state = 121;
				this.rename();
				}
				break;

			case 10:
				this.enterOuterAlt(_localctx, 10);
				{
				this.state = 122;
				this.delete();
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public model(): ModelContext {
		let _localctx: ModelContext = new ModelContext(this._ctx, this.state);
		this.enterRule(_localctx, 10, AntimonyParser.RULE_model);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 125;
			this.match(AntimonyParser.MODEL);
			this.state = 127;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === AntimonyParser.T__1) {
				{
				this.state = 126;
				_localctx._star = this.match(AntimonyParser.T__1);
				}
			}

			this.state = 129;
			this.match(AntimonyParser.NAME);
			this.state = 131;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === AntimonyParser.T__2) {
				{
				this.state = 130;
				this.exportList();
				}
			}

			this.state = 133;
			this.statementList();
			this.state = 134;
			this.match(AntimonyParser.END);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public exportList(): ExportListContext {
		let _localctx: ExportListContext = new ExportListContext(this._ctx, this.state);
		this.enterRule(_localctx, 12, AntimonyParser.RULE_exportList);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 136;
			this.match(AntimonyParser.T__2);
			this.state = 145;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === AntimonyParser.T__12 || _la === AntimonyParser.NAME) {
				{
				this.state = 137;
				this.variable(0);
				this.state = 142;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === AntimonyParser.T__3) {
					{
					{
					this.state = 138;
					this.match(AntimonyParser.T__3);
					this.state = 139;
					this.variable(0);
					}
					}
					this.state = 144;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				}
			}

			this.state = 147;
			this.match(AntimonyParser.T__4);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public functionDefinition(): FunctionDefinitionContext {
		let _localctx: FunctionDefinitionContext = new FunctionDefinitionContext(this._ctx, this.state);
		this.enterRule(_localctx, 14, AntimonyParser.RULE_functionDefinition);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 149;
			this.match(AntimonyParser.FUNCTION);
			this.state = 150;
			this.match(AntimonyParser.NAME);
			this.state = 151;
			this.parameterList();
			this.state = 155;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === AntimonyParser.T__0 || _la === AntimonyParser.NEWLINE) {
				{
				{
				this.state = 152;
				this.statementSeparator();
				}
				}
				this.state = 157;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 158;
			this.formula(0);
			this.state = 162;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === AntimonyParser.T__0 || _la === AntimonyParser.NEWLINE) {
				{
				{
				this.state = 159;
				this.statementSeparator();
				}
				}
				this.state = 164;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 165;
			this.match(AntimonyParser.END);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public parameterList(): ParameterListContext {
		let _localctx: ParameterListContext = new ParameterListContext(this._ctx, this.state);
		this.enterRule(_localctx, 16, AntimonyParser.RULE_parameterList);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 167;
			this.match(AntimonyParser.T__2);
			this.state = 176;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === AntimonyParser.NAME) {
				{
				this.state = 168;
				this.match(AntimonyParser.NAME);
				this.state = 173;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === AntimonyParser.T__3) {
					{
					{
					this.state = 169;
					this.match(AntimonyParser.T__3);
					this.state = 170;
					this.match(AntimonyParser.NAME);
					}
					}
					this.state = 175;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				}
			}

			this.state = 178;
			this.match(AntimonyParser.T__4);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}

	public formula(): FormulaContext;
	public formula(_p: number): FormulaContext;
	// @RuleVersion(0)
	public formula(_p?: number): FormulaContext {
		if (_p === undefined) {
			_p = 0;
		}

		let _parentctx: ParserRuleContext = this._ctx;
		let _parentState: number = this.state;
		let _localctx: FormulaContext = new FormulaContext(this._ctx, _parentState);
		let _prevctx: FormulaContext = _localctx;
		let _startState: number = 18;
		this.enterRecursionRule(_localctx, 18, AntimonyParser.RULE_formula, _p);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 194;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 15, this._ctx) ) {
			case 1:
				{
				_localctx = new GroupContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;

				this.state = 181;
				this.match(AntimonyParser.T__2);
				this.state = 182;
				this.formula(0);
				this.state = 183;
				this.match(AntimonyParser.T__4);
				}
				break;

			case 2:
				{
				_localctx = new NumberContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 185;
				this.match(AntimonyParser.NUMBER);
				}
				break;

			case 3:
				{
				_localctx = new CallContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 186;
				this.functionCall();
				}
				break;

			case 4:
				{
				_localctx = new VarContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 187;
				this.variable(0);
				}
				break;

			case 5:
				{
				_localctx = new PositiveContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 188;
				this.match(AntimonyParser.T__6);
				this.state = 189;
				this.formula(7);
				}
				break;

			case 6:
				{
				_localctx = new NegativeContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 190;
				this.match(AntimonyParser.T__7);
				this.state = 191;
				this.formula(6);
				}
				break;

			case 7:
				{
				_localctx = new NotContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 192;
				this.match(AntimonyParser.T__8);
				this.state = 193;
				this.formula(5);
				}
				break;
			}
			this._ctx._stop = this._input.tryLT(-1);
			this.state = 213;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 17, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = _localctx;
					{
					this.state = 211;
					this._errHandler.sync(this);
					switch ( this.interpreter.adaptivePredict(this._input, 16, this._ctx) ) {
					case 1:
						{
						_localctx = new PowerContext(new FormulaContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, AntimonyParser.RULE_formula);
						this.state = 196;
						if (!(this.precpred(this._ctx, 8))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 8)");
						}
						this.state = 197;
						this.match(AntimonyParser.T__5);
						this.state = 198;
						this.formula(8);
						}
						break;

					case 2:
						{
						_localctx = new ProductContext(new FormulaContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, AntimonyParser.RULE_formula);
						this.state = 199;
						if (!(this.precpred(this._ctx, 4))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 4)");
						}
						this.state = 200;
						(_localctx as ProductContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if (!((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << AntimonyParser.T__1) | (1 << AntimonyParser.T__9) | (1 << AntimonyParser.T__10))) !== 0))) {
							(_localctx as ProductContext)._op = this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						this.state = 201;
						this.formula(5);
						}
						break;

					case 3:
						{
						_localctx = new SumContext(new FormulaContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, AntimonyParser.RULE_formula);
						this.state = 202;
						if (!(this.precpred(this._ctx, 3))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 3)");
						}
						this.state = 203;
						(_localctx as SumContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if (!(_la === AntimonyParser.T__6 || _la === AntimonyParser.T__7)) {
							(_localctx as SumContext)._op = this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						this.state = 204;
						this.formula(4);
						}
						break;

					case 4:
						{
						_localctx = new CompareContext(new FormulaContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, AntimonyParser.RULE_formula);
						this.state = 205;
						if (!(this.precpred(this._ctx, 2))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 2)");
						}
						this.state = 206;
						(_localctx as CompareContext)._op = this.match(AntimonyParser.COMPARE);
						this.state = 207;
						this.formula(3);
						}
						break;

					case 5:
						{
						_localctx = new LogicalContext(new FormulaContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, AntimonyParser.RULE_formula);
						this.state = 208;
						if (!(this.precpred(this._ctx, 1))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 1)");
						}
						this.state = 209;
						(_localctx as LogicalContext)._op = this.match(AntimonyParser.LOGICAL);
						this.state = 210;
						this.formula(2);
						}
						break;
					}
					}
				}
				this.state = 215;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 17, this._ctx);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.unrollRecursionContexts(_parentctx);
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public functionCall(): FunctionCallContext {
		let _localctx: FunctionCallContext = new FunctionCallContext(this._ctx, this.state);
		this.enterRule(_localctx, 20, AntimonyParser.RULE_functionCall);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 216;
			this.match(AntimonyParser.NAME);
			this.state = 217;
			this.match(AntimonyParser.T__2);
			this.state = 219;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << AntimonyParser.T__2) | (1 << AntimonyParser.T__6) | (1 << AntimonyParser.T__7) | (1 << AntimonyParser.T__8) | (1 << AntimonyParser.T__12) | (1 << AntimonyParser.NAME) | (1 << AntimonyParser.NUMBER))) !== 0)) {
				{
				this.state = 218;
				this.argumentList();
				}
			}

			this.state = 221;
			this.match(AntimonyParser.T__4);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public argumentList(): ArgumentListContext {
		let _localctx: ArgumentListContext = new ArgumentListContext(this._ctx, this.state);
		this.enterRule(_localctx, 22, AntimonyParser.RULE_argumentList);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 223;
			this.formula(0);
			this.state = 228;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === AntimonyParser.T__3) {
				{
				{
				this.state = 224;
				this.match(AntimonyParser.T__3);
				this.state = 225;
				this.formula(0);
				}
				}
				this.state = 230;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}

	public variable(): VariableContext;
	public variable(_p: number): VariableContext;
	// @RuleVersion(0)
	public variable(_p?: number): VariableContext {
		if (_p === undefined) {
			_p = 0;
		}

		let _parentctx: ParserRuleContext = this._ctx;
		let _parentState: number = this.state;
		let _localctx: VariableContext = new VariableContext(this._ctx, _parentState);
		let _prevctx: VariableContext = _localctx;
		let _startState: number = 24;
		this.enterRecursionRule(_localctx, 24, AntimonyParser.RULE_variable, _p);
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 235;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case AntimonyParser.NAME:
				{
				_localctx = new NameContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;

				this.state = 232;
				this.match(AntimonyParser.NAME);
				}
				break;
			case AntimonyParser.T__12:
				{
				_localctx = new ConstantContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 233;
				this.match(AntimonyParser.T__12);
				this.state = 234;
				this.variable(1);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			this._ctx._stop = this._input.tryLT(-1);
			this.state = 242;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 21, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = _localctx;
					{
					{
					_localctx = new SubvariableContext(new VariableContext(_parentctx, _parentState));
					this.pushNewRecursionContext(_localctx, _startState, AntimonyParser.RULE_variable);
					this.state = 237;
					if (!(this.precpred(this._ctx, 2))) {
						throw this.createFailedPredicateException("this.precpred(this._ctx, 2)");
					}
					this.state = 238;
					this.match(AntimonyParser.T__11);
					this.state = 239;
					this.match(AntimonyParser.NAME);
					}
					}
				}
				this.state = 244;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 21, this._ctx);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.unrollRecursionContexts(_parentctx);
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public inCompartment(): InCompartmentContext {
		let _localctx: InCompartmentContext = new InCompartmentContext(this._ctx, this.state);
		this.enterRule(_localctx, 26, AntimonyParser.RULE_inCompartment);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 245;
			this.match(AntimonyParser.IN);
			this.state = 246;
			this.variable(0);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public nameLabel(): NameLabelContext {
		let _localctx: NameLabelContext = new NameLabelContext(this._ctx, this.state);
		this.enterRule(_localctx, 28, AntimonyParser.RULE_nameLabel);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 248;
			this.match(AntimonyParser.NAME);
			this.state = 253;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === AntimonyParser.T__11) {
				{
				{
				this.state = 249;
				this.match(AntimonyParser.T__11);
				this.state = 250;
				this.match(AntimonyParser.NAME);
				}
				}
				this.state = 255;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 257;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === AntimonyParser.IN) {
				{
				this.state = 256;
				this.inCompartment();
				}
			}

			this.state = 259;
			this.match(AntimonyParser.T__13);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public reaction(): ReactionContext {
		let _localctx: ReactionContext = new ReactionContext(this._ctx, this.state);
		this.enterRule(_localctx, 30, AntimonyParser.RULE_reaction);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 262;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 24, this._ctx) ) {
			case 1:
				{
				this.state = 261;
				this.nameLabel();
				}
				break;
			}
			this.state = 264;
			this.reactionFormula();
			this.state = 265;
			this.match(AntimonyParser.T__0);
			this.state = 267;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << AntimonyParser.T__2) | (1 << AntimonyParser.T__6) | (1 << AntimonyParser.T__7) | (1 << AntimonyParser.T__8) | (1 << AntimonyParser.T__12) | (1 << AntimonyParser.NAME) | (1 << AntimonyParser.NUMBER))) !== 0)) {
				{
				this.state = 266;
				this.formula(0);
				}
			}

			this.state = 270;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === AntimonyParser.IN) {
				{
				this.state = 269;
				this.inCompartment();
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public reactionFormula(): ReactionFormulaContext {
		let _localctx: ReactionFormulaContext = new ReactionFormulaContext(this._ctx, this.state);
		this.enterRule(_localctx, 32, AntimonyParser.RULE_reactionFormula);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 273;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << AntimonyParser.T__7) | (1 << AntimonyParser.T__12) | (1 << AntimonyParser.NAME) | (1 << AntimonyParser.NUMBER))) !== 0)) {
				{
				this.state = 272;
				_localctx._left = this.reactantList();
				}
			}

			this.state = 275;
			this.match(AntimonyParser.ARROW);
			this.state = 277;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << AntimonyParser.T__7) | (1 << AntimonyParser.T__12) | (1 << AntimonyParser.NAME) | (1 << AntimonyParser.NUMBER))) !== 0)) {
				{
				this.state = 276;
				_localctx._right = this.reactantList();
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public reactantList(): ReactantListContext {
		let _localctx: ReactantListContext = new ReactantListContext(this._ctx, this.state);
		this.enterRule(_localctx, 34, AntimonyParser.RULE_reactantList);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 279;
			this.reactant();
			this.state = 284;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === AntimonyParser.T__6) {
				{
				{
				this.state = 280;
				this.match(AntimonyParser.T__6);
				this.state = 281;
				this.reactant();
				}
				}
				this.state = 286;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public reactant(): ReactantContext {
		let _localctx: ReactantContext = new ReactantContext(this._ctx, this.state);
		this.enterRule(_localctx, 36, AntimonyParser.RULE_reactant);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 288;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 30, this._ctx) ) {
			case 1:
				{
				this.state = 287;
				this.stoichiometry();
				}
				break;
			}
			this.state = 290;
			this.variable(0);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public stoichiometry(): StoichiometryContext {
		let _localctx: StoichiometryContext = new StoichiometryContext(this._ctx, this.state);
		this.enterRule(_localctx, 38, AntimonyParser.RULE_stoichiometry);
		let _la: number;
		try {
			this.state = 297;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case AntimonyParser.T__7:
			case AntimonyParser.NUMBER:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 293;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === AntimonyParser.T__7) {
					{
					this.state = 292;
					this.match(AntimonyParser.T__7);
					}
				}

				this.state = 295;
				this.match(AntimonyParser.NUMBER);
				}
				break;
			case AntimonyParser.T__12:
			case AntimonyParser.NAME:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 296;
				this.variable(0);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public assignment(): AssignmentContext {
		let _localctx: AssignmentContext = new AssignmentContext(this._ctx, this.state);
		this.enterRule(_localctx, 40, AntimonyParser.RULE_assignment);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 299;
			this.variable(0);
			this.state = 301;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === AntimonyParser.IN) {
				{
				this.state = 300;
				this.inCompartment();
				}
			}

			this.state = 304;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === AntimonyParser.T__13 || _la === AntimonyParser.T__14) {
				{
				this.state = 303;
				_localctx._mod = this._input.LT(1);
				_la = this._input.LA(1);
				if (!(_la === AntimonyParser.T__13 || _la === AntimonyParser.T__14)) {
					_localctx._mod = this._errHandler.recoverInline(this);
				} else {
					if (this._input.LA(1) === Token.EOF) {
						this.matchedEOF = true;
					}

					this._errHandler.reportMatch(this);
					this.consume();
				}
				}
			}

			this.state = 306;
			this.match(AntimonyParser.T__15);
			this.state = 308;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << AntimonyParser.T__2) | (1 << AntimonyParser.T__6) | (1 << AntimonyParser.T__7) | (1 << AntimonyParser.T__8) | (1 << AntimonyParser.T__12) | (1 << AntimonyParser.NAME) | (1 << AntimonyParser.NUMBER))) !== 0)) {
				{
				this.state = 307;
				this.formula(0);
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public declaration(): DeclarationContext {
		let _localctx: DeclarationContext = new DeclarationContext(this._ctx, this.state);
		this.enterRule(_localctx, 42, AntimonyParser.RULE_declaration);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 310;
			this.declarationHead();
			this.state = 311;
			this.declarationTerm();
			this.state = 316;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === AntimonyParser.T__3) {
				{
				{
				this.state = 312;
				this.match(AntimonyParser.T__3);
				this.state = 313;
				this.declarationTerm();
				}
				}
				this.state = 318;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public declarationHead(): DeclarationHeadContext {
		let _localctx: DeclarationHeadContext = new DeclarationHeadContext(this._ctx, this.state);
		this.enterRule(_localctx, 44, AntimonyParser.RULE_declarationHead);
		let _la: number;
		try {
			this.state = 333;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 40, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 319;
				this.match(AntimonyParser.CONST_MODIFIER);
				this.state = 321;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === AntimonyParser.SUBS_ONLY) {
					{
					this.state = 320;
					this.match(AntimonyParser.SUBS_ONLY);
					}
				}

				this.state = 323;
				this.match(AntimonyParser.DECL_WORD);
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 324;
				this.match(AntimonyParser.CONST_MODIFIER);
				this.state = 326;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === AntimonyParser.SUBS_ONLY) {
					{
					this.state = 325;
					this.match(AntimonyParser.SUBS_ONLY);
					}
				}

				}
				break;

			case 3:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 329;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === AntimonyParser.SUBS_ONLY) {
					{
					this.state = 328;
					this.match(AntimonyParser.SUBS_ONLY);
					}
				}

				this.state = 331;
				this.match(AntimonyParser.DECL_WORD);
				}
				break;

			case 4:
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 332;
				this.match(AntimonyParser.SUBS_ONLY);
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public declarationTerm(): DeclarationTermContext {
		let _localctx: DeclarationTermContext = new DeclarationTermContext(this._ctx, this.state);
		this.enterRule(_localctx, 46, AntimonyParser.RULE_declarationTerm);
		let _la: number;
		try {
			this.state = 340;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 42, this._ctx) ) {
			case 1:
				_localctx = new DeclarationAssignmentContext(_localctx);
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 335;
				this.assignment();
				}
				break;

			case 2:
				_localctx = new DeclarationNameContext(_localctx);
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 336;
				this.variable(0);
				this.state = 338;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === AntimonyParser.IN) {
					{
					this.state = 337;
					this.inCompartment();
					}
				}

				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public event(): EventContext {
		let _localctx: EventContext = new EventContext(this._ctx, this.state);
		this.enterRule(_localctx, 48, AntimonyParser.RULE_event);
		let _la: number;
		try {
			this.state = 368;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 49, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 343;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === AntimonyParser.NAME) {
					{
					this.state = 342;
					this.nameLabel();
					}
				}

				this.state = 345;
				this.match(AntimonyParser.AT);
				this.state = 346;
				_localctx._trigger = this.formula(0);
				this.state = 348;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === AntimonyParser.T__3) {
					{
					this.state = 347;
					this.eventOptions();
					}
				}

				this.state = 350;
				this.match(AntimonyParser.T__13);
				this.state = 352;
				this._errHandler.sync(this);
				switch ( this.interpreter.adaptivePredict(this._input, 45, this._ctx) ) {
				case 1:
					{
					this.state = 351;
					this.eventAssignments();
					}
					break;
				}
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 355;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === AntimonyParser.NAME) {
					{
					this.state = 354;
					this.nameLabel();
					}
				}

				this.state = 357;
				this.match(AntimonyParser.AT);
				this.state = 358;
				_localctx._delay = this.formula(0);
				this.state = 359;
				this.match(AntimonyParser.AFTER);
				this.state = 360;
				_localctx._trigger = this.formula(0);
				this.state = 362;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === AntimonyParser.T__3) {
					{
					this.state = 361;
					this.eventOptions();
					}
				}

				this.state = 364;
				this.match(AntimonyParser.T__13);
				this.state = 366;
				this._errHandler.sync(this);
				switch ( this.interpreter.adaptivePredict(this._input, 48, this._ctx) ) {
				case 1:
					{
					this.state = 365;
					this.eventAssignments();
					}
					break;
				}
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public eventOptions(): EventOptionsContext {
		let _localctx: EventOptionsContext = new EventOptionsContext(this._ctx, this.state);
		this.enterRule(_localctx, 50, AntimonyParser.RULE_eventOptions);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 372;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			do {
				{
				{
				this.state = 370;
				this.match(AntimonyParser.T__3);
				this.state = 371;
				this.eventOption();
				}
				}
				this.state = 374;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			} while (_la === AntimonyParser.T__3);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public eventOption(): EventOptionContext {
		let _localctx: EventOptionContext = new EventOptionContext(this._ctx, this.state);
		this.enterRule(_localctx, 52, AntimonyParser.RULE_eventOption);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 376;
			this.match(AntimonyParser.NAME);
			this.state = 377;
			this.match(AntimonyParser.T__15);
			this.state = 378;
			this.formula(0);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public eventAssignments(): EventAssignmentsContext {
		let _localctx: EventAssignmentsContext = new EventAssignmentsContext(this._ctx, this.state);
		this.enterRule(_localctx, 54, AntimonyParser.RULE_eventAssignments);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 383;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === AntimonyParser.NEWLINE) {
				{
				{
				this.state = 380;
				this.match(AntimonyParser.NEWLINE);
				}
				}
				this.state = 385;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 386;
			this.eventAssignment();
			this.state = 397;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === AntimonyParser.T__3) {
				{
				{
				this.state = 387;
				this.match(AntimonyParser.T__3);
				this.state = 391;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === AntimonyParser.NEWLINE) {
					{
					{
					this.state = 388;
					this.match(AntimonyParser.NEWLINE);
					}
					}
					this.state = 393;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 394;
				this.eventAssignment();
				}
				}
				this.state = 399;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public eventAssignment(): EventAssignmentContext {
		let _localctx: EventAssignmentContext = new EventAssignmentContext(this._ctx, this.state);
		this.enterRule(_localctx, 56, AntimonyParser.RULE_eventAssignment);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 400;
			this.variable(0);
			this.state = 401;
			this.match(AntimonyParser.T__15);
			this.state = 402;
			this.formula(0);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public rename(): RenameContext {
		let _localctx: RenameContext = new RenameContext(this._ctx, this.state);
		this.enterRule(_localctx, 58, AntimonyParser.RULE_rename);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 404;
			this.variable(0);
			this.state = 405;
			this.match(AntimonyParser.IS);
			this.state = 406;
			this.variable(0);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public delete(): DeleteContext {
		let _localctx: DeleteContext = new DeleteContext(this._ctx, this.state);
		this.enterRule(_localctx, 60, AntimonyParser.RULE_delete);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 408;
			this.match(AntimonyParser.DELETE);
			this.state = 409;
			this.variable(0);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public annotation(): AnnotationContext {
		let _localctx: AnnotationContext = new AnnotationContext(this._ctx, this.state);
		this.enterRule(_localctx, 62, AntimonyParser.RULE_annotation);
		try {
			this.state = 414;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 54, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 411;
				this.variableAnnotation();
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 412;
				this.hasAnnotation();
				}
				break;

			case 3:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 413;
				this.modelAnnotation();
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public variableAnnotation(): VariableAnnotationContext {
		let _localctx: VariableAnnotationContext = new VariableAnnotationContext(this._ctx, this.state);
		this.enterRule(_localctx, 64, AntimonyParser.RULE_variableAnnotation);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 416;
			this.variable(0);
			this.state = 417;
			this.annotationBody();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public hasAnnotation(): HasAnnotationContext {
		let _localctx: HasAnnotationContext = new HasAnnotationContext(this._ctx, this.state);
		this.enterRule(_localctx, 66, AntimonyParser.RULE_hasAnnotation);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 419;
			this.variable(0);
			this.state = 420;
			this.match(AntimonyParser.HAS);
			this.state = 421;
			this.unitFormula(0);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public modelAnnotation(): ModelAnnotationContext {
		let _localctx: ModelAnnotationContext = new ModelAnnotationContext(this._ctx, this.state);
		this.enterRule(_localctx, 68, AntimonyParser.RULE_modelAnnotation);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 423;
			this.match(AntimonyParser.MODEL);
			this.state = 425;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 55, this._ctx) ) {
			case 1:
				{
				this.state = 424;
				this.match(AntimonyParser.NAME);
				}
				break;
			}
			this.state = 427;
			this.annotationBody();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public annotationBody(): AnnotationBodyContext {
		let _localctx: AnnotationBodyContext = new AnnotationBodyContext(this._ctx, this.state);
		this.enterRule(_localctx, 70, AntimonyParser.RULE_annotationBody);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 429;
			this.annotationItem();
			this.state = 430;
			this.string();
			this.state = 438;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === AntimonyParser.T__3) {
				{
				{
				this.state = 431;
				this.match(AntimonyParser.T__3);
				this.state = 433;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === AntimonyParser.NEWLINE) {
					{
					this.state = 432;
					this.match(AntimonyParser.NEWLINE);
					}
				}

				this.state = 435;
				this.string();
				}
				}
				this.state = 440;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public annotationItem(): AnnotationItemContext {
		let _localctx: AnnotationItemContext = new AnnotationItemContext(this._ctx, this.state);
		this.enterRule(_localctx, 72, AntimonyParser.RULE_annotationItem);
		try {
			this.state = 446;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 58, this._ctx) ) {
			case 1:
				_localctx = new AnnotationIsContext(_localctx);
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 441;
				this.match(AntimonyParser.IS);
				}
				break;

			case 2:
				_localctx = new AnnotationNameContext(_localctx);
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 442;
				this.match(AntimonyParser.NAME);
				}
				break;

			case 3:
				_localctx = new AnnotationSubItemContext(_localctx);
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 443;
				this.match(AntimonyParser.NAME);
				this.state = 444;
				this.match(AntimonyParser.T__11);
				this.state = 445;
				this.annotationItem();
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public string(): StringContext {
		let _localctx: StringContext = new StringContext(this._ctx, this.state);
		this.enterRule(_localctx, 74, AntimonyParser.RULE_string);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 448;
			_la = this._input.LA(1);
			if (!(_la === AntimonyParser.STRING || _la === AntimonyParser.LONG_STRING)) {
			this._errHandler.recoverInline(this);
			} else {
				if (this._input.LA(1) === Token.EOF) {
					this.matchedEOF = true;
				}

				this._errHandler.reportMatch(this);
				this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public unitDeclaration(): UnitDeclarationContext {
		let _localctx: UnitDeclarationContext = new UnitDeclarationContext(this._ctx, this.state);
		this.enterRule(_localctx, 76, AntimonyParser.RULE_unitDeclaration);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 450;
			this.match(AntimonyParser.UNIT);
			this.state = 451;
			this.match(AntimonyParser.NAME);
			this.state = 454;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === AntimonyParser.T__15) {
				{
				this.state = 452;
				this.match(AntimonyParser.T__15);
				this.state = 453;
				this.unitFormula(0);
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}

	public unitFormula(): UnitFormulaContext;
	public unitFormula(_p: number): UnitFormulaContext;
	// @RuleVersion(0)
	public unitFormula(_p?: number): UnitFormulaContext {
		if (_p === undefined) {
			_p = 0;
		}

		let _parentctx: ParserRuleContext = this._ctx;
		let _parentState: number = this.state;
		let _localctx: UnitFormulaContext = new UnitFormulaContext(this._ctx, _parentState);
		let _prevctx: UnitFormulaContext = _localctx;
		let _startState: number = 78;
		this.enterRecursionRule(_localctx, 78, AntimonyParser.RULE_unitFormula, _p);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 471;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case AntimonyParser.T__2:
				{
				_localctx = new UnitGroupContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;

				this.state = 457;
				this.match(AntimonyParser.T__2);
				this.state = 458;
				this.unitFormula(0);
				this.state = 459;
				this.match(AntimonyParser.T__4);
				}
				break;
			case AntimonyParser.NUMBER:
				{
				_localctx = new UnitNumberContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 461;
				this.match(AntimonyParser.NUMBER);
				this.state = 463;
				this._errHandler.sync(this);
				switch ( this.interpreter.adaptivePredict(this._input, 60, this._ctx) ) {
				case 1:
					{
					this.state = 462;
					(_localctx as UnitNumberContext)._unit = this.match(AntimonyParser.NAME);
					}
					break;
				}
				}
				break;
			case AntimonyParser.NAME:
				{
				_localctx = new UnitNameContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 465;
				this.match(AntimonyParser.NAME);
				}
				break;
			case AntimonyParser.STRING:
			case AntimonyParser.LONG_STRING:
				{
				_localctx = new UnitNameContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 466;
				this.string();
				}
				break;
			case AntimonyParser.T__6:
				{
				_localctx = new UnitPositiveContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 467;
				this.match(AntimonyParser.T__6);
				this.state = 468;
				this.unitFormula(5);
				}
				break;
			case AntimonyParser.T__7:
				{
				_localctx = new UnitNegativeContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 469;
				this.match(AntimonyParser.T__7);
				this.state = 470;
				this.unitFormula(4);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			this._ctx._stop = this._input.tryLT(-1);
			this.state = 484;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 63, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = _localctx;
					{
					this.state = 482;
					this._errHandler.sync(this);
					switch ( this.interpreter.adaptivePredict(this._input, 62, this._ctx) ) {
					case 1:
						{
						_localctx = new UnitPowerContext(new UnitFormulaContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, AntimonyParser.RULE_unitFormula);
						this.state = 473;
						if (!(this.precpred(this._ctx, 3))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 3)");
						}
						this.state = 474;
						this.match(AntimonyParser.T__5);
						this.state = 475;
						this.unitFormula(3);
						}
						break;

					case 2:
						{
						_localctx = new UnitProductContext(new UnitFormulaContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, AntimonyParser.RULE_unitFormula);
						this.state = 476;
						if (!(this.precpred(this._ctx, 2))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 2)");
						}
						this.state = 477;
						(_localctx as UnitProductContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if (!((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << AntimonyParser.T__1) | (1 << AntimonyParser.T__9) | (1 << AntimonyParser.T__10))) !== 0))) {
							(_localctx as UnitProductContext)._op = this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						this.state = 478;
						this.unitFormula(3);
						}
						break;

					case 3:
						{
						_localctx = new UnitSumContext(new UnitFormulaContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, AntimonyParser.RULE_unitFormula);
						this.state = 479;
						if (!(this.precpred(this._ctx, 1))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 1)");
						}
						this.state = 480;
						(_localctx as UnitSumContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if (!(_la === AntimonyParser.T__6 || _la === AntimonyParser.T__7)) {
							(_localctx as UnitSumContext)._op = this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						this.state = 481;
						this.unitFormula(2);
						}
						break;
					}
					}
				}
				this.state = 486;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 63, this._ctx);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.unrollRecursionContexts(_parentctx);
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public inStatement(): InStatementContext {
		let _localctx: InStatementContext = new InStatementContext(this._ctx, this.state);
		this.enterRule(_localctx, 80, AntimonyParser.RULE_inStatement);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 487;
			this.variable(0);
			this.state = 488;
			this.inCompartment();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public modelImport(): ModelImportContext {
		let _localctx: ModelImportContext = new ModelImportContext(this._ctx, this.state);
		this.enterRule(_localctx, 82, AntimonyParser.RULE_modelImport);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 491;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 64, this._ctx) ) {
			case 1:
				{
				this.state = 490;
				this.nameLabel();
				}
				break;
			}
			this.state = 493;
			this.match(AntimonyParser.NAME);
			this.state = 494;
			this.exportList();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}

	public sempred(_localctx: RuleContext, ruleIndex: number, predIndex: number): boolean {
		switch (ruleIndex) {
		case 9:
			return this.formula_sempred(_localctx as FormulaContext, predIndex);

		case 12:
			return this.variable_sempred(_localctx as VariableContext, predIndex);

		case 39:
			return this.unitFormula_sempred(_localctx as UnitFormulaContext, predIndex);
		}
		return true;
	}
	private formula_sempred(_localctx: FormulaContext, predIndex: number): boolean {
		switch (predIndex) {
		case 0:
			return this.precpred(this._ctx, 8);

		case 1:
			return this.precpred(this._ctx, 4);

		case 2:
			return this.precpred(this._ctx, 3);

		case 3:
			return this.precpred(this._ctx, 2);

		case 4:
			return this.precpred(this._ctx, 1);
		}
		return true;
	}
	private variable_sempred(_localctx: VariableContext, predIndex: number): boolean {
		switch (predIndex) {
		case 5:
			return this.precpred(this._ctx, 2);
		}
		return true;
	}
	private unitFormula_sempred(_localctx: UnitFormulaContext, predIndex: number): boolean {
		switch (predIndex) {
		case 6:
			return this.precpred(this._ctx, 3);

		case 7:
			return this.precpred(this._ctx, 2);

		case 8:
			return this.precpred(this._ctx, 1);
		}
		return true;
	}

	public static readonly _serializedATN: string =
		"\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x03,\u01F3\x04\x02" +
		"\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06\x04\x07" +
		"\t\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04\v\t\v\x04\f\t\f\x04\r\t\r\x04" +
		"\x0E\t\x0E\x04\x0F\t\x0F\x04\x10\t\x10\x04\x11\t\x11\x04\x12\t\x12\x04" +
		"\x13\t\x13\x04\x14\t\x14\x04\x15\t\x15\x04\x16\t\x16\x04\x17\t\x17\x04" +
		"\x18\t\x18\x04\x19\t\x19\x04\x1A\t\x1A\x04\x1B\t\x1B\x04\x1C\t\x1C\x04" +
		"\x1D\t\x1D\x04\x1E\t\x1E\x04\x1F\t\x1F\x04 \t \x04!\t!\x04\"\t\"\x04#" +
		"\t#\x04$\t$\x04%\t%\x04&\t&\x04\'\t\'\x04(\t(\x04)\t)\x04*\t*\x04+\t+" +
		"\x03\x02\x05\x02X\n\x02\x03\x02\x03\x02\x05\x02\\\n\x02\x07\x02^\n\x02" +
		"\f\x02\x0E\x02a\v\x02\x03\x02\x03\x02\x03\x03\x03\x03\x03\x04\x03\x04" +
		"\x03\x04\x05\x04j\n\x04\x03\x05\x05\x05m\n\x05\x03\x05\x06\x05p\n\x05" +
		"\r\x05\x0E\x05q\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06" +
		"\x03\x06\x03\x06\x03\x06\x05\x06~\n\x06\x03\x07\x03\x07\x05\x07\x82\n" +
		"\x07\x03\x07\x03\x07\x05\x07\x86\n\x07\x03\x07\x03\x07\x03\x07\x03\b\x03" +
		"\b\x03\b\x03\b\x07\b\x8F\n\b\f\b\x0E\b\x92\v\b\x05\b\x94\n\b\x03\b\x03" +
		"\b\x03\t\x03\t\x03\t\x03\t\x07\t\x9C\n\t\f\t\x0E\t\x9F\v\t\x03\t\x03\t" +
		"\x07\t\xA3\n\t\f\t\x0E\t\xA6\v\t\x03\t\x03\t\x03\n\x03\n\x03\n\x03\n\x07" +
		"\n\xAE\n\n\f\n\x0E\n\xB1\v\n\x05\n\xB3\n\n\x03\n\x03\n\x03\v\x03\v\x03" +
		"\v\x03\v\x03\v\x03\v\x03\v\x03\v\x03\v\x03\v\x03\v\x03\v\x03\v\x03\v\x05" +
		"\v\xC5\n\v\x03\v\x03\v\x03\v\x03\v\x03\v\x03\v\x03\v\x03\v\x03\v\x03\v" +
		"\x03\v\x03\v\x03\v\x03\v\x03\v\x07\v\xD6\n\v\f\v\x0E\v\xD9\v\v\x03\f\x03" +
		"\f\x03\f\x05\f\xDE\n\f\x03\f\x03\f\x03\r\x03\r\x03\r\x07\r\xE5\n\r\f\r" +
		"\x0E\r\xE8\v\r\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x05\x0E\xEE\n\x0E\x03\x0E" +
		"\x03\x0E\x03\x0E\x07\x0E\xF3\n\x0E\f\x0E\x0E\x0E\xF6\v\x0E\x03\x0F\x03" +
		"\x0F\x03\x0F\x03\x10\x03\x10\x03\x10\x07\x10\xFE\n\x10\f\x10\x0E\x10\u0101" +
		"\v\x10\x03\x10\x05\x10\u0104\n\x10\x03\x10\x03\x10\x03\x11\x05\x11\u0109" +
		"\n\x11\x03\x11\x03\x11\x03\x11\x05\x11\u010E\n\x11\x03\x11\x05\x11\u0111" +
		"\n\x11\x03\x12\x05\x12\u0114\n\x12\x03\x12\x03\x12\x05\x12\u0118\n\x12" +
		"\x03\x13\x03\x13\x03\x13\x07\x13\u011D\n\x13\f\x13\x0E\x13\u0120\v\x13" +
		"\x03\x14\x05\x14\u0123\n\x14\x03\x14\x03\x14\x03\x15\x05\x15\u0128\n\x15" +
		"\x03\x15\x03\x15\x05\x15\u012C\n\x15\x03\x16\x03\x16\x05\x16\u0130\n\x16" +
		"\x03\x16\x05\x16\u0133\n\x16\x03\x16\x03\x16\x05\x16\u0137\n\x16\x03\x17" +
		"\x03\x17\x03\x17\x03\x17\x07\x17\u013D\n\x17\f\x17\x0E\x17\u0140\v\x17" +
		"\x03\x18\x03\x18\x05\x18\u0144\n\x18\x03\x18\x03\x18\x03\x18\x05\x18\u0149" +
		"\n\x18\x03\x18\x05\x18\u014C\n\x18\x03\x18\x03\x18\x05\x18\u0150\n\x18" +
		"\x03\x19\x03\x19\x03\x19\x05\x19\u0155\n\x19\x05\x19\u0157\n\x19\x03\x1A" +
		"\x05\x1A\u015A\n\x1A\x03\x1A\x03\x1A\x03\x1A\x05\x1A\u015F\n\x1A\x03\x1A" +
		"\x03\x1A\x05\x1A\u0163\n\x1A\x03\x1A\x05\x1A\u0166\n\x1A\x03\x1A\x03\x1A" +
		"\x03\x1A\x03\x1A\x03\x1A\x05\x1A\u016D\n\x1A\x03\x1A\x03\x1A\x05\x1A\u0171" +
		"\n\x1A\x05\x1A\u0173\n\x1A\x03\x1B\x03\x1B\x06\x1B\u0177\n\x1B\r\x1B\x0E" +
		"\x1B\u0178\x03\x1C\x03\x1C\x03\x1C\x03\x1C\x03\x1D\x07\x1D\u0180\n\x1D" +
		"\f\x1D\x0E\x1D\u0183\v\x1D\x03\x1D\x03\x1D\x03\x1D\x07\x1D\u0188\n\x1D" +
		"\f\x1D\x0E\x1D\u018B\v\x1D\x03\x1D\x07\x1D\u018E\n\x1D\f\x1D\x0E\x1D\u0191" +
		"\v\x1D\x03\x1E\x03\x1E\x03\x1E\x03\x1E\x03\x1F\x03\x1F\x03\x1F\x03\x1F" +
		"\x03 \x03 \x03 \x03!\x03!\x03!\x05!\u01A1\n!\x03\"\x03\"\x03\"\x03#\x03" +
		"#\x03#\x03#\x03$\x03$\x05$\u01AC\n$\x03$\x03$\x03%\x03%\x03%\x03%\x05" +
		"%\u01B4\n%\x03%\x07%\u01B7\n%\f%\x0E%\u01BA\v%\x03&\x03&\x03&\x03&\x03" +
		"&\x05&\u01C1\n&\x03\'\x03\'\x03(\x03(\x03(\x03(\x05(\u01C9\n(\x03)\x03" +
		")\x03)\x03)\x03)\x03)\x03)\x05)\u01D2\n)\x03)\x03)\x03)\x03)\x03)\x03" +
		")\x05)\u01DA\n)\x03)\x03)\x03)\x03)\x03)\x03)\x03)\x03)\x03)\x07)\u01E5" +
		"\n)\f)\x0E)\u01E8\v)\x03*\x03*\x03*\x03+\x05+\u01EE\n+\x03+\x03+\x03+" +
		"\x03+\x02\x02\x05\x14\x1AP,\x02\x02\x04\x02\x06\x02\b\x02\n\x02\f\x02" +
		"\x0E\x02\x10\x02\x12\x02\x14\x02\x16\x02\x18\x02\x1A\x02\x1C\x02\x1E\x02" +
		" \x02\"\x02$\x02&\x02(\x02*\x02,\x02.\x020\x022\x024\x026\x028\x02:\x02" +
		"<\x02>\x02@\x02B\x02D\x02F\x02H\x02J\x02L\x02N\x02P\x02R\x02T\x02\x02" +
		"\x07\x04\x02\x03\x03))\x04\x02\x04\x04\f\r\x03\x02\t\n\x03\x02\x10\x11" +
		"\x03\x02\'(\x02\u0223\x02W\x03\x02\x02\x02\x04d\x03\x02\x02\x02\x06i\x03" +
		"\x02\x02\x02\bo\x03\x02\x02\x02\n}\x03\x02\x02\x02\f\x7F\x03\x02\x02\x02" +
		"\x0E\x8A\x03\x02\x02\x02\x10\x97\x03\x02\x02\x02\x12\xA9\x03\x02\x02\x02" +
		"\x14\xC4\x03\x02\x02\x02\x16\xDA\x03\x02\x02\x02\x18\xE1\x03\x02\x02\x02" +
		"\x1A\xED\x03\x02\x02\x02\x1C\xF7\x03\x02\x02\x02\x1E\xFA\x03\x02\x02\x02" +
		" \u0108\x03\x02\x02\x02\"\u0113\x03\x02\x02\x02$\u0119\x03\x02\x02\x02" +
		"&\u0122\x03\x02\x02\x02(\u012B\x03\x02\x02\x02*\u012D\x03\x02\x02\x02" +
		",\u0138\x03\x02\x02\x02.\u014F\x03\x02\x02\x020\u0156\x03\x02\x02\x02" +
		"2\u0172\x03\x02\x02\x024\u0176\x03\x02\x02\x026\u017A\x03\x02\x02\x02" +
		"8\u0181\x03\x02\x02\x02:\u0192\x03\x02\x02\x02<\u0196\x03\x02\x02\x02" +
		">\u019A\x03\x02\x02\x02@\u01A0\x03\x02\x02\x02B\u01A2\x03\x02\x02\x02" +
		"D\u01A5\x03\x02\x02\x02F\u01A9\x03\x02\x02\x02H\u01AF\x03\x02\x02\x02" +
		"J\u01C0\x03\x02\x02\x02L\u01C2\x03\x02\x02\x02N\u01C4\x03\x02\x02\x02" +
		"P\u01D9\x03\x02\x02\x02R\u01E9\x03\x02\x02\x02T\u01ED\x03\x02\x02\x02" +
		"VX\x05\x06\x04\x02WV\x03\x02\x02\x02WX\x03\x02\x02\x02X_\x03\x02\x02\x02" +
		"Y[\x05\x04\x03\x02Z\\\x05\x06\x04\x02[Z\x03\x02\x02\x02[\\\x03\x02\x02" +
		"\x02\\^\x03\x02\x02\x02]Y\x03\x02\x02\x02^a\x03\x02\x02\x02_]\x03\x02" +
		"\x02\x02_`\x03\x02\x02\x02`b\x03\x02\x02\x02a_\x03\x02\x02\x02bc\x07\x02" +
		"\x02\x03c\x03\x03\x02\x02\x02de\t\x02\x02\x02e\x05\x03\x02\x02\x02fj\x05" +
		"\f\x07\x02gj\x05\x10\t\x02hj\x05\n\x06\x02if\x03\x02\x02\x02ig\x03\x02" +
		"\x02\x02ih\x03\x02\x02\x02j\x07\x03\x02\x02\x02km\x05\n\x06\x02lk\x03" +
		"\x02\x02\x02lm\x03\x02\x02\x02mn\x03\x02\x02\x02np\x05\x04\x03\x02ol\x03" +
		"\x02\x02\x02pq\x03\x02\x02\x02qo\x03\x02\x02\x02qr\x03\x02\x02\x02r\t" +
		"\x03\x02\x02\x02s~\x05 \x11\x02t~\x05*\x16\x02u~\x05,\x17\x02v~\x05T+" +
		"\x02w~\x052\x1A\x02x~\x05@!\x02y~\x05N(\x02z~\x05R*\x02{~\x05<\x1F\x02" +
		"|~\x05> \x02}s\x03\x02\x02\x02}t\x03\x02\x02\x02}u\x03\x02\x02\x02}v\x03" +
		"\x02\x02\x02}w\x03\x02\x02\x02}x\x03\x02\x02\x02}y\x03\x02\x02\x02}z\x03" +
		"\x02\x02\x02}{\x03\x02\x02\x02}|\x03\x02\x02\x02~\v\x03\x02\x02\x02\x7F" +
		"\x81\x07\x13\x02\x02\x80\x82\x07\x04\x02\x02\x81\x80\x03\x02\x02\x02\x81" +
		"\x82\x03\x02\x02\x02\x82\x83\x03\x02\x02\x02\x83\x85\x07 \x02\x02\x84" +
		"\x86\x05\x0E\b\x02\x85\x84\x03\x02\x02\x02\x85\x86\x03\x02\x02\x02\x86" +
		"\x87\x03\x02\x02\x02\x87\x88\x05\b\x05\x02\x88\x89\x07\x15\x02\x02\x89" +
		"\r\x03\x02\x02\x02\x8A\x93\x07\x05\x02\x02\x8B\x90\x05\x1A\x0E\x02\x8C" +
		"\x8D\x07\x06\x02\x02\x8D\x8F\x05\x1A\x0E\x02\x8E\x8C\x03\x02\x02\x02\x8F" +
		"\x92\x03\x02\x02\x02\x90\x8E\x03\x02\x02\x02\x90\x91\x03\x02\x02\x02\x91" +
		"\x94\x03\x02\x02\x02\x92\x90\x03\x02\x02\x02\x93\x8B\x03\x02\x02\x02\x93" +
		"\x94\x03\x02\x02\x02\x94\x95\x03\x02\x02\x02\x95\x96\x07\x07\x02\x02\x96" +
		"\x0F\x03\x02\x02\x02\x97\x98\x07\x14\x02\x02\x98\x99\x07 \x02\x02\x99" +
		"\x9D\x05\x12\n\x02\x9A\x9C\x05\x04\x03\x02\x9B\x9A\x03\x02\x02\x02\x9C" +
		"\x9F\x03\x02\x02\x02\x9D\x9B\x03\x02\x02\x02\x9D\x9E\x03\x02\x02\x02\x9E" +
		"\xA0\x03\x02\x02\x02\x9F\x9D\x03\x02\x02\x02\xA0\xA4\x05\x14\v\x02\xA1" +
		"\xA3\x05\x04\x03\x02\xA2\xA1\x03\x02\x02\x02\xA3\xA6\x03\x02\x02\x02\xA4" +
		"\xA2\x03\x02\x02\x02\xA4\xA5\x03\x02\x02\x02\xA5\xA7\x03\x02\x02\x02\xA6" +
		"\xA4\x03\x02\x02\x02\xA7\xA8\x07\x15\x02\x02\xA8\x11\x03\x02\x02\x02\xA9" +
		"\xB2\x07\x05\x02\x02\xAA\xAF\x07 \x02\x02\xAB\xAC\x07\x06\x02\x02\xAC" +
		"\xAE\x07 \x02\x02\xAD\xAB\x03\x02\x02\x02\xAE\xB1\x03\x02\x02\x02\xAF" +
		"\xAD\x03\x02\x02\x02\xAF\xB0\x03\x02\x02\x02\xB0\xB3\x03\x02\x02\x02\xB1" +
		"\xAF\x03\x02\x02\x02\xB2\xAA\x03\x02\x02\x02\xB2\xB3\x03\x02\x02\x02\xB3" +
		"\xB4\x03\x02\x02\x02\xB4\xB5\x07\x07\x02\x02\xB5\x13\x03\x02\x02\x02\xB6" +
		"\xB7\b\v\x01\x02\xB7\xB8\x07\x05\x02\x02\xB8\xB9\x05\x14\v\x02\xB9\xBA" +
		"\x07\x07\x02\x02\xBA\xC5\x03\x02\x02\x02\xBB\xC5\x07!\x02\x02\xBC\xC5" +
		"\x05\x16\f\x02\xBD\xC5\x05\x1A\x0E\x02\xBE\xBF\x07\t\x02\x02\xBF\xC5\x05" +
		"\x14\v\t\xC0\xC1\x07\n\x02\x02\xC1\xC5\x05\x14\v\b\xC2\xC3\x07\v\x02\x02" +
		"\xC3\xC5\x05\x14\v\x07\xC4\xB6\x03\x02\x02\x02\xC4\xBB\x03\x02\x02\x02" +
		"\xC4\xBC\x03\x02\x02\x02\xC4\xBD\x03\x02\x02\x02\xC4\xBE\x03\x02\x02\x02" +
		"\xC4\xC0\x03\x02\x02\x02\xC4\xC2\x03\x02\x02\x02\xC5\xD7\x03\x02\x02\x02" +
		"\xC6\xC7\f\n\x02\x02\xC7\xC8\x07\b\x02\x02\xC8\xD6\x05\x14\v\n\xC9\xCA" +
		"\f\x06\x02\x02\xCA\xCB\t\x03\x02\x02\xCB\xD6\x05\x14\v\x07\xCC\xCD\f\x05" +
		"\x02\x02\xCD\xCE\t\x04\x02\x02\xCE\xD6\x05\x14\v\x06\xCF\xD0\f\x04\x02" +
		"\x02\xD0\xD1\x07%\x02\x02\xD1\xD6\x05\x14\v\x05\xD2\xD3\f\x03\x02\x02" +
		"\xD3\xD4\x07&\x02\x02\xD4\xD6\x05\x14\v\x04\xD5\xC6\x03\x02\x02\x02\xD5" +
		"\xC9\x03\x02\x02\x02\xD5\xCC\x03\x02\x02\x02\xD5\xCF\x03\x02\x02\x02\xD5" +
		"\xD2\x03\x02\x02\x02\xD6\xD9\x03\x02\x02\x02\xD7\xD5\x03\x02\x02\x02\xD7" +
		"\xD8\x03\x02\x02\x02\xD8\x15\x03\x02\x02\x02\xD9\xD7\x03\x02\x02\x02\xDA" +
		"\xDB\x07 \x02\x02\xDB\xDD\x07\x05\x02\x02\xDC\xDE\x05\x18\r\x02\xDD\xDC" +
		"\x03\x02\x02\x02\xDD\xDE\x03\x02\x02\x02\xDE\xDF\x03\x02\x02\x02\xDF\xE0" +
		"\x07\x07\x02\x02\xE0\x17\x03\x02\x02\x02\xE1\xE6\x05\x14\v\x02\xE2\xE3" +
		"\x07\x06\x02\x02\xE3\xE5\x05\x14\v\x02\xE4\xE2\x03\x02\x02\x02\xE5\xE8" +
		"\x03\x02\x02\x02\xE6\xE4\x03\x02\x02\x02\xE6\xE7\x03\x02\x02\x02\xE7\x19" +
		"\x03\x02\x02\x02\xE8\xE6\x03\x02\x02\x02\xE9\xEA\b\x0E\x01\x02\xEA\xEE" +
		"\x07 \x02\x02\xEB\xEC\x07\x0F\x02\x02\xEC\xEE\x05\x1A\x0E\x03\xED\xE9" +
		"\x03\x02\x02\x02\xED\xEB\x03\x02\x02\x02\xEE\xF4\x03\x02\x02\x02\xEF\xF0" +
		"\f\x04\x02\x02\xF0\xF1\x07\x0E\x02\x02\xF1\xF3\x07 \x02\x02\xF2\xEF\x03" +
		"\x02\x02\x02\xF3\xF6\x03\x02\x02\x02\xF4\xF2\x03\x02\x02\x02\xF4\xF5\x03" +
		"\x02\x02\x02\xF5\x1B\x03\x02\x02\x02\xF6\xF4\x03\x02\x02\x02\xF7\xF8\x07" +
		"\x16\x02\x02\xF8\xF9\x05\x1A\x0E\x02\xF9\x1D\x03\x02\x02\x02\xFA\xFF\x07" +
		" \x02\x02\xFB\xFC\x07\x0E\x02\x02\xFC\xFE\x07 \x02\x02\xFD\xFB\x03\x02" +
		"\x02\x02\xFE\u0101\x03\x02\x02\x02\xFF\xFD\x03\x02\x02\x02\xFF\u0100\x03" +
		"\x02\x02\x02\u0100\u0103\x03\x02\x02\x02\u0101\xFF\x03\x02\x02\x02\u0102" +
		"\u0104\x05\x1C\x0F\x02\u0103\u0102\x03\x02\x02\x02\u0103\u0104\x03\x02" +
		"\x02\x02\u0104\u0105\x03\x02\x02\x02\u0105\u0106\x07\x10\x02\x02\u0106" +
		"\x1F\x03\x02\x02\x02\u0107\u0109\x05\x1E\x10\x02\u0108\u0107\x03\x02\x02" +
		"\x02\u0108\u0109\x03\x02\x02\x02\u0109\u010A\x03\x02\x02\x02\u010A\u010B" +
		"\x05\"\x12\x02\u010B\u010D\x07\x03\x02\x02\u010C\u010E\x05\x14\v\x02\u010D" +
		"\u010C\x03\x02\x02\x02\u010D\u010E\x03\x02\x02\x02\u010E\u0110\x03\x02" +
		"\x02\x02\u010F\u0111\x05\x1C\x0F\x02\u0110\u010F\x03\x02\x02\x02\u0110" +
		"\u0111\x03\x02\x02\x02\u0111!\x03\x02\x02\x02\u0112\u0114\x05$\x13\x02" +
		"\u0113\u0112\x03\x02\x02\x02\u0113\u0114\x03\x02\x02\x02\u0114\u0115\x03" +
		"\x02\x02\x02\u0115\u0117\x07\"\x02\x02\u0116\u0118\x05$\x13\x02\u0117" +
		"\u0116\x03\x02\x02\x02\u0117\u0118\x03\x02\x02\x02\u0118#\x03\x02\x02" +
		"\x02\u0119\u011E\x05&\x14\x02\u011A\u011B\x07\t\x02\x02\u011B\u011D\x05" +
		"&\x14\x02\u011C\u011A\x03\x02\x02\x02\u011D\u0120\x03\x02\x02\x02\u011E" +
		"\u011C\x03\x02\x02\x02\u011E\u011F\x03\x02\x02\x02\u011F%\x03\x02\x02" +
		"\x02\u0120\u011E\x03\x02\x02\x02\u0121\u0123\x05(\x15\x02\u0122\u0121" +
		"\x03\x02\x02\x02\u0122\u0123\x03\x02\x02\x02\u0123\u0124\x03\x02\x02\x02" +
		"\u0124\u0125\x05\x1A\x0E\x02\u0125\'\x03\x02\x02\x02\u0126\u0128\x07\n" +
		"\x02\x02\u0127\u0126\x03\x02\x02\x02\u0127\u0128\x03\x02\x02\x02\u0128" +
		"\u0129\x03\x02\x02\x02\u0129\u012C\x07!\x02\x02\u012A\u012C\x05\x1A\x0E" +
		"\x02\u012B\u0127\x03\x02\x02\x02\u012B\u012A\x03\x02\x02\x02\u012C)\x03" +
		"\x02\x02\x02\u012D\u012F\x05\x1A\x0E\x02\u012E\u0130\x05\x1C\x0F\x02\u012F" +
		"\u012E\x03\x02\x02\x02\u012F\u0130\x03\x02\x02\x02\u0130\u0132\x03\x02" +
		"\x02\x02\u0131\u0133\t\x05\x02\x02\u0132\u0131\x03\x02\x02\x02\u0132\u0133" +
		"\x03\x02\x02\x02\u0133\u0134\x03\x02\x02\x02\u0134\u0136\x07\x12\x02\x02" +
		"\u0135\u0137\x05\x14\v\x02\u0136\u0135\x03\x02\x02\x02\u0136\u0137\x03" +
		"\x02\x02\x02\u0137+\x03\x02\x02\x02\u0138\u0139\x05.\x18\x02\u0139\u013E" +
		"\x050\x19\x02\u013A\u013B\x07\x06\x02\x02\u013B\u013D\x050\x19\x02\u013C" +
		"\u013A\x03\x02\x02\x02\u013D\u0140\x03\x02\x02\x02\u013E\u013C\x03\x02" +
		"\x02\x02\u013E\u013F\x03\x02\x02\x02\u013F-\x03\x02\x02\x02\u0140\u013E" +
		"\x03\x02\x02\x02\u0141\u0143\x07\x1E\x02\x02\u0142\u0144\x07\x1C\x02\x02" +
		"\u0143\u0142\x03\x02\x02\x02\u0143\u0144\x03\x02\x02\x02\u0144\u0145\x03" +
		"\x02\x02\x02\u0145\u0150\x07\x1F\x02\x02\u0146\u0148\x07\x1E\x02\x02\u0147" +
		"\u0149\x07\x1C\x02\x02\u0148\u0147\x03\x02\x02\x02\u0148\u0149\x03\x02" +
		"\x02\x02\u0149\u0150\x03\x02\x02\x02\u014A\u014C\x07\x1C\x02\x02\u014B" +
		"\u014A\x03\x02\x02\x02\u014B\u014C\x03\x02\x02\x02\u014C\u014D\x03\x02" +
		"\x02\x02\u014D\u0150\x07\x1F\x02\x02\u014E\u0150\x07\x1C\x02\x02\u014F" +
		"\u0141\x03\x02\x02\x02\u014F\u0146\x03\x02\x02\x02\u014F\u014B\x03\x02" +
		"\x02\x02\u014F\u014E\x03\x02\x02\x02\u0150/\x03\x02\x02\x02\u0151\u0157" +
		"\x05*\x16\x02\u0152\u0154\x05\x1A\x0E\x02\u0153\u0155\x05\x1C\x0F\x02" +
		"\u0154\u0153\x03\x02\x02\x02\u0154\u0155\x03\x02\x02\x02\u0155\u0157\x03" +
		"\x02\x02\x02\u0156\u0151\x03\x02\x02\x02\u0156\u0152\x03\x02\x02\x02\u0157" +
		"1\x03\x02\x02\x02\u0158\u015A\x05\x1E\x10\x02\u0159\u0158\x03\x02\x02" +
		"\x02\u0159\u015A\x03\x02\x02\x02\u015A\u015B\x03\x02\x02\x02\u015B\u015C" +
		"\x07\x18\x02\x02\u015C\u015E\x05\x14\v\x02\u015D\u015F\x054\x1B\x02\u015E" +
		"\u015D\x03\x02\x02\x02\u015E\u015F\x03\x02\x02\x02\u015F\u0160\x03\x02" +
		"\x02\x02\u0160\u0162\x07\x10\x02\x02\u0161\u0163\x058\x1D\x02\u0162\u0161" +
		"\x03\x02\x02\x02\u0162\u0163\x03\x02\x02\x02\u0163\u0173\x03\x02\x02\x02" +
		"\u0164\u0166\x05\x1E\x10\x02\u0165\u0164\x03\x02\x02\x02\u0165\u0166\x03" +
		"\x02\x02\x02\u0166\u0167\x03\x02\x02\x02\u0167\u0168\x07\x18\x02\x02\u0168" +
		"\u0169\x05\x14\v\x02\u0169\u016A\x07\x19\x02\x02\u016A\u016C\x05\x14\v" +
		"\x02\u016B\u016D\x054\x1B\x02\u016C\u016B\x03\x02\x02\x02\u016C\u016D" +
		"\x03\x02\x02\x02\u016D\u016E\x03\x02\x02\x02\u016E\u0170\x07\x10\x02\x02" +
		"\u016F\u0171\x058\x1D\x02\u0170\u016F\x03\x02\x02\x02\u0170\u0171\x03" +
		"\x02\x02\x02\u0171\u0173\x03\x02\x02\x02\u0172\u0159\x03\x02\x02\x02\u0172" +
		"\u0165\x03\x02\x02\x02\u01733\x03\x02\x02\x02\u0174\u0175\x07\x06\x02" +
		"\x02\u0175\u0177\x056\x1C\x02\u0176\u0174\x03\x02\x02\x02\u0177\u0178" +
		"\x03\x02\x02\x02\u0178\u0176\x03\x02\x02\x02\u0178\u0179\x03\x02\x02\x02" +
		"\u01795\x03\x02\x02\x02\u017A\u017B\x07 \x02\x02\u017B\u017C\x07\x12\x02" +
		"\x02\u017C\u017D\x05\x14\v\x02\u017D7\x03\x02\x02\x02\u017E\u0180\x07" +
		")\x02\x02\u017F\u017E\x03\x02\x02\x02\u0180\u0183\x03\x02\x02\x02\u0181" +
		"\u017F\x03\x02\x02\x02\u0181\u0182\x03\x02\x02\x02\u0182\u0184\x03\x02" +
		"\x02\x02\u0183\u0181\x03\x02\x02\x02\u0184\u018F\x05:\x1E\x02\u0185\u0189" +
		"\x07\x06\x02\x02\u0186\u0188\x07)\x02\x02\u0187\u0186\x03\x02\x02\x02" +
		"\u0188\u018B\x03\x02\x02\x02\u0189\u0187\x03\x02\x02\x02\u0189\u018A\x03" +
		"\x02\x02\x02\u018A\u018C\x03\x02\x02\x02\u018B\u0189\x03\x02\x02\x02\u018C" +
		"\u018E\x05:\x1E\x02\u018D\u0185\x03\x02\x02\x02\u018E\u0191\x03\x02\x02" +
		"\x02\u018F\u018D\x03\x02\x02\x02\u018F\u0190\x03\x02\x02\x02\u01909\x03" +
		"\x02\x02\x02\u0191\u018F\x03\x02\x02\x02\u0192\u0193\x05\x1A\x0E\x02\u0193" +
		"\u0194\x07\x12\x02\x02\u0194\u0195\x05\x14\v\x02\u0195;\x03\x02\x02\x02" +
		"\u0196\u0197\x05\x1A\x0E\x02\u0197\u0198\x07\x17\x02\x02\u0198\u0199\x05" +
		"\x1A\x0E\x02\u0199=\x03\x02\x02\x02\u019A\u019B\x07\x1D\x02\x02\u019B" +
		"\u019C\x05\x1A\x0E\x02\u019C?\x03\x02\x02\x02\u019D\u01A1\x05B\"\x02\u019E" +
		"\u01A1\x05D#\x02\u019F\u01A1\x05F$\x02\u01A0\u019D\x03\x02\x02\x02\u01A0" +
		"\u019E\x03\x02\x02\x02\u01A0\u019F\x03\x02\x02\x02\u01A1A\x03\x02\x02" +
		"\x02\u01A2\u01A3\x05\x1A\x0E\x02\u01A3\u01A4\x05H%\x02\u01A4C\x03\x02" +
		"\x02\x02\u01A5\u01A6\x05\x1A\x0E\x02\u01A6\u01A7\x07\x1B\x02\x02\u01A7" +
		"\u01A8\x05P)\x02\u01A8E\x03\x02\x02\x02\u01A9\u01AB\x07\x13\x02\x02\u01AA" +
		"\u01AC\x07 \x02\x02\u01AB\u01AA\x03\x02\x02\x02\u01AB\u01AC\x03\x02\x02" +
		"\x02\u01AC\u01AD\x03\x02\x02\x02\u01AD\u01AE\x05H%\x02\u01AEG\x03\x02" +
		"\x02\x02\u01AF\u01B0\x05J&\x02\u01B0\u01B8\x05L\'\x02\u01B1\u01B3\x07" +
		"\x06\x02\x02\u01B2\u01B4\x07)\x02\x02\u01B3\u01B2\x03\x02\x02\x02\u01B3" +
		"\u01B4\x03\x02\x02\x02\u01B4\u01B5\x03\x02\x02\x02\u01B5\u01B7\x05L\'" +
		"\x02\u01B6\u01B1\x03\x02\x02\x02\u01B7\u01BA\x03\x02\x02\x02\u01B8\u01B6" +
		"\x03\x02\x02\x02\u01B8\u01B9\x03\x02\x02\x02\u01B9I\x03\x02\x02\x02\u01BA" +
		"\u01B8\x03\x02\x02\x02\u01BB\u01C1\x07\x17\x02\x02\u01BC\u01C1\x07 \x02" +
		"\x02\u01BD\u01BE\x07 \x02\x02\u01BE\u01BF\x07\x0E\x02\x02\u01BF\u01C1" +
		"\x05J&\x02\u01C0\u01BB\x03\x02\x02\x02\u01C0\u01BC\x03\x02\x02\x02\u01C0" +
		"\u01BD\x03\x02\x02\x02\u01C1K\x03\x02\x02\x02\u01C2\u01C3\t\x06\x02\x02" +
		"\u01C3M\x03\x02\x02\x02\u01C4\u01C5\x07\x1A\x02\x02\u01C5\u01C8\x07 \x02" +
		"\x02\u01C6\u01C7\x07\x12\x02\x02\u01C7\u01C9\x05P)\x02\u01C8\u01C6\x03" +
		"\x02\x02\x02\u01C8\u01C9\x03\x02\x02\x02\u01C9O\x03\x02\x02\x02\u01CA" +
		"\u01CB\b)\x01\x02\u01CB\u01CC\x07\x05\x02\x02\u01CC\u01CD\x05P)\x02\u01CD" +
		"\u01CE\x07\x07\x02\x02\u01CE\u01DA\x03\x02\x02\x02\u01CF\u01D1\x07!\x02" +
		"\x02\u01D0\u01D2\x07 \x02\x02\u01D1\u01D0\x03\x02\x02\x02\u01D1\u01D2" +
		"\x03\x02\x02\x02\u01D2\u01DA\x03\x02\x02\x02\u01D3\u01DA\x07 \x02\x02" +
		"\u01D4\u01DA\x05L\'\x02\u01D5\u01D6\x07\t\x02\x02\u01D6\u01DA\x05P)\x07" +
		"\u01D7\u01D8\x07\n\x02\x02\u01D8\u01DA\x05P)\x06\u01D9\u01CA\x03\x02\x02" +
		"\x02\u01D9\u01CF\x03\x02\x02\x02\u01D9\u01D3\x03\x02\x02\x02\u01D9\u01D4" +
		"\x03\x02\x02\x02\u01D9\u01D5\x03\x02\x02\x02\u01D9\u01D7\x03\x02\x02\x02" +
		"\u01DA\u01E6\x03\x02\x02\x02\u01DB\u01DC\f\x05\x02\x02\u01DC\u01DD\x07" +
		"\b\x02\x02\u01DD\u01E5\x05P)\x05\u01DE\u01DF\f\x04\x02\x02\u01DF\u01E0" +
		"\t\x03\x02\x02\u01E0\u01E5\x05P)\x05\u01E1\u01E2\f\x03\x02\x02\u01E2\u01E3" +
		"\t\x04\x02\x02\u01E3\u01E5\x05P)\x04\u01E4\u01DB\x03\x02\x02\x02\u01E4" +
		"\u01DE\x03\x02\x02\x02\u01E4\u01E1\x03\x02\x02\x02\u01E5\u01E8\x03\x02" +
		"\x02\x02\u01E6\u01E4\x03\x02\x02\x02\u01E6\u01E7\x03\x02\x02\x02\u01E7" +
		"Q\x03\x02\x02\x02\u01E8\u01E6\x03\x02\x02\x02\u01E9\u01EA\x05\x1A\x0E" +
		"\x02\u01EA\u01EB\x05\x1C\x0F\x02\u01EBS\x03\x02\x02\x02\u01EC\u01EE\x05" +
		"\x1E\x10\x02\u01ED\u01EC\x03\x02\x02\x02\u01ED\u01EE\x03\x02\x02\x02\u01EE" +
		"\u01EF\x03\x02\x02\x02\u01EF\u01F0\x07 \x02\x02\u01F0\u01F1\x05\x0E\b" +
		"\x02\u01F1U\x03\x02\x02\x02CW[_ilq}\x81\x85\x90\x93\x9D\xA4\xAF\xB2\xC4" +
		"\xD5\xD7\xDD\xE6\xED\xF4\xFF\u0103\u0108\u010D\u0110\u0113\u0117\u011E" +
		"\u0122\u0127\u012B\u012F\u0132\u0136\u013E\u0143\u0148\u014B\u014F\u0154" +
		"\u0156\u0159\u015E\u0162\u0165\u016C\u0170\u0172\u0178\u0181\u0189\u018F" +
		"\u01A0\u01AB\u01B3\u01B8\u01C0\u01C8\u01D1\u01D9\u01E4\u01E6\u01ED";
	public static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!AntimonyParser.__ATN) {
			AntimonyParser.__ATN = new ATNDeserializer().deserialize(Utils.toCharArray(AntimonyParser._serializedATN));
		}

		return AntimonyParser.__ATN;
	}

}

export class RootContext extends ParserRuleContext {
	public EOF(): TerminalNode { return this.getToken(AntimonyParser.EOF, 0); }
	public topLevelStatement(): TopLevelStatementContext[];
	public topLevelStatement(i: number): TopLevelStatementContext;
	public topLevelStatement(i?: number): TopLevelStatementContext | TopLevelStatementContext[] {
		if (i === undefined) {
			return this.getRuleContexts(TopLevelStatementContext);
		} else {
			return this.getRuleContext(i, TopLevelStatementContext);
		}
	}
	public statementSeparator(): StatementSeparatorContext[];
	public statementSeparator(i: number): StatementSeparatorContext;
	public statementSeparator(i?: number): StatementSeparatorContext | StatementSeparatorContext[] {
		if (i === undefined) {
			return this.getRuleContexts(StatementSeparatorContext);
		} else {
			return this.getRuleContext(i, StatementSeparatorContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return AntimonyParser.RULE_root; }
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterRoot) {
			listener.enterRoot(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitRoot) {
			listener.exitRoot(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitRoot) {
			return visitor.visitRoot(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class StatementSeparatorContext extends ParserRuleContext {
	public NEWLINE(): TerminalNode { return this.getToken(AntimonyParser.NEWLINE, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return AntimonyParser.RULE_statementSeparator; }
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterStatementSeparator) {
			listener.enterStatementSeparator(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitStatementSeparator) {
			listener.exitStatementSeparator(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitStatementSeparator) {
			return visitor.visitStatementSeparator(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class TopLevelStatementContext extends ParserRuleContext {
	public model(): ModelContext | undefined {
		return this.tryGetRuleContext(0, ModelContext);
	}
	public functionDefinition(): FunctionDefinitionContext | undefined {
		return this.tryGetRuleContext(0, FunctionDefinitionContext);
	}
	public statement(): StatementContext | undefined {
		return this.tryGetRuleContext(0, StatementContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return AntimonyParser.RULE_topLevelStatement; }
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterTopLevelStatement) {
			listener.enterTopLevelStatement(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitTopLevelStatement) {
			listener.exitTopLevelStatement(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitTopLevelStatement) {
			return visitor.visitTopLevelStatement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class StatementListContext extends ParserRuleContext {
	public statementSeparator(): StatementSeparatorContext[];
	public statementSeparator(i: number): StatementSeparatorContext;
	public statementSeparator(i?: number): StatementSeparatorContext | StatementSeparatorContext[] {
		if (i === undefined) {
			return this.getRuleContexts(StatementSeparatorContext);
		} else {
			return this.getRuleContext(i, StatementSeparatorContext);
		}
	}
	public statement(): StatementContext[];
	public statement(i: number): StatementContext;
	public statement(i?: number): StatementContext | StatementContext[] {
		if (i === undefined) {
			return this.getRuleContexts(StatementContext);
		} else {
			return this.getRuleContext(i, StatementContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return AntimonyParser.RULE_statementList; }
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterStatementList) {
			listener.enterStatementList(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitStatementList) {
			listener.exitStatementList(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitStatementList) {
			return visitor.visitStatementList(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class StatementContext extends ParserRuleContext {
	public reaction(): ReactionContext | undefined {
		return this.tryGetRuleContext(0, ReactionContext);
	}
	public assignment(): AssignmentContext | undefined {
		return this.tryGetRuleContext(0, AssignmentContext);
	}
	public declaration(): DeclarationContext | undefined {
		return this.tryGetRuleContext(0, DeclarationContext);
	}
	public modelImport(): ModelImportContext | undefined {
		return this.tryGetRuleContext(0, ModelImportContext);
	}
	public event(): EventContext | undefined {
		return this.tryGetRuleContext(0, EventContext);
	}
	public annotation(): AnnotationContext | undefined {
		return this.tryGetRuleContext(0, AnnotationContext);
	}
	public unitDeclaration(): UnitDeclarationContext | undefined {
		return this.tryGetRuleContext(0, UnitDeclarationContext);
	}
	public inStatement(): InStatementContext | undefined {
		return this.tryGetRuleContext(0, InStatementContext);
	}
	public rename(): RenameContext | undefined {
		return this.tryGetRuleContext(0, RenameContext);
	}
	public delete(): DeleteContext | undefined {
		return this.tryGetRuleContext(0, DeleteContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return AntimonyParser.RULE_statement; }
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterStatement) {
			listener.enterStatement(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitStatement) {
			listener.exitStatement(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitStatement) {
			return visitor.visitStatement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ModelContext extends ParserRuleContext {
	public _star!: Token;
	public MODEL(): TerminalNode { return this.getToken(AntimonyParser.MODEL, 0); }
	public NAME(): TerminalNode { return this.getToken(AntimonyParser.NAME, 0); }
	public statementList(): StatementListContext {
		return this.getRuleContext(0, StatementListContext);
	}
	public END(): TerminalNode { return this.getToken(AntimonyParser.END, 0); }
	public exportList(): ExportListContext | undefined {
		return this.tryGetRuleContext(0, ExportListContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return AntimonyParser.RULE_model; }
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterModel) {
			listener.enterModel(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitModel) {
			listener.exitModel(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitModel) {
			return visitor.visitModel(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ExportListContext extends ParserRuleContext {
	public variable(): VariableContext[];
	public variable(i: number): VariableContext;
	public variable(i?: number): VariableContext | VariableContext[] {
		if (i === undefined) {
			return this.getRuleContexts(VariableContext);
		} else {
			return this.getRuleContext(i, VariableContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return AntimonyParser.RULE_exportList; }
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterExportList) {
			listener.enterExportList(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitExportList) {
			listener.exitExportList(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitExportList) {
			return visitor.visitExportList(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class FunctionDefinitionContext extends ParserRuleContext {
	public FUNCTION(): TerminalNode { return this.getToken(AntimonyParser.FUNCTION, 0); }
	public NAME(): TerminalNode { return this.getToken(AntimonyParser.NAME, 0); }
	public parameterList(): ParameterListContext {
		return this.getRuleContext(0, ParameterListContext);
	}
	public formula(): FormulaContext {
		return this.getRuleContext(0, FormulaContext);
	}
	public END(): TerminalNode { return this.getToken(AntimonyParser.END, 0); }
	public statementSeparator(): StatementSeparatorContext[];
	public statementSeparator(i: number): StatementSeparatorContext;
	public statementSeparator(i?: number): StatementSeparatorContext | StatementSeparatorContext[] {
		if (i === undefined) {
			return this.getRuleContexts(StatementSeparatorContext);
		} else {
			return this.getRuleContext(i, StatementSeparatorContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return AntimonyParser.RULE_functionDefinition; }
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterFunctionDefinition) {
			listener.enterFunctionDefinition(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitFunctionDefinition) {
			listener.exitFunctionDefinition(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitFunctionDefinition) {
			return visitor.visitFunctionDefinition(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ParameterListContext extends ParserRuleContext {
	public NAME(): TerminalNode[];
	public NAME(i: number): TerminalNode;
	public NAME(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(AntimonyParser.NAME);
		} else {
			return this.getToken(AntimonyParser.NAME, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return AntimonyParser.RULE_parameterList; }
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterParameterList) {
			listener.enterParameterList(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitParameterList) {
			listener.exitParameterList(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitParameterList) {
			return visitor.visitParameterList(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class FormulaContext extends ParserRuleContext {
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return AntimonyParser.RULE_formula; }
	public copyFrom(ctx: FormulaContext): void {
		super.copyFrom(ctx);
	}
}
export class GroupContext extends FormulaContext {
	public formula(): FormulaContext {
		return this.getRuleContext(0, FormulaContext);
	}
	constructor(ctx: FormulaContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterGroup) {
			listener.enterGroup(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitGroup) {
			listener.exitGroup(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitGroup) {
			return visitor.visitGroup(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class NumberContext extends FormulaContext {
	public NUMBER(): TerminalNode { return this.getToken(AntimonyParser.NUMBER, 0); }
	constructor(ctx: FormulaContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterNumber) {
			listener.enterNumber(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitNumber) {
			listener.exitNumber(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitNumber) {
			return visitor.visitNumber(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class CallContext extends FormulaContext {
	public functionCall(): FunctionCallContext {
		return this.getRuleContext(0, FunctionCallContext);
	}
	constructor(ctx: FormulaContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterCall) {
			listener.enterCall(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitCall) {
			listener.exitCall(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitCall) {
			return visitor.visitCall(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class VarContext extends FormulaContext {
	public variable(): VariableContext {
		return this.getRuleContext(0, VariableContext);
	}
	constructor(ctx: FormulaContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterVar) {
			listener.enterVar(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitVar) {
			listener.exitVar(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitVar) {
			return visitor.visitVar(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class PowerContext extends FormulaContext {
	public formula(): FormulaContext[];
	public formula(i: number): FormulaContext;
	public formula(i?: number): FormulaContext | FormulaContext[] {
		if (i === undefined) {
			return this.getRuleContexts(FormulaContext);
		} else {
			return this.getRuleContext(i, FormulaContext);
		}
	}
	constructor(ctx: FormulaContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterPower) {
			listener.enterPower(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitPower) {
			listener.exitPower(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitPower) {
			return visitor.visitPower(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class PositiveContext extends FormulaContext {
	public formula(): FormulaContext {
		return this.getRuleContext(0, FormulaContext);
	}
	constructor(ctx: FormulaContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterPositive) {
			listener.enterPositive(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitPositive) {
			listener.exitPositive(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitPositive) {
			return visitor.visitPositive(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class NegativeContext extends FormulaContext {
	public formula(): FormulaContext {
		return this.getRuleContext(0, FormulaContext);
	}
	constructor(ctx: FormulaContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterNegative) {
			listener.enterNegative(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitNegative) {
			listener.exitNegative(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitNegative) {
			return visitor.visitNegative(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class NotContext extends FormulaContext {
	public formula(): FormulaContext {
		return this.getRuleContext(0, FormulaContext);
	}
	constructor(ctx: FormulaContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterNot) {
			listener.enterNot(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitNot) {
			listener.exitNot(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitNot) {
			return visitor.visitNot(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ProductContext extends FormulaContext {
	public _op!: Token;
	public formula(): FormulaContext[];
	public formula(i: number): FormulaContext;
	public formula(i?: number): FormulaContext | FormulaContext[] {
		if (i === undefined) {
			return this.getRuleContexts(FormulaContext);
		} else {
			return this.getRuleContext(i, FormulaContext);
		}
	}
	constructor(ctx: FormulaContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterProduct) {
			listener.enterProduct(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitProduct) {
			listener.exitProduct(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitProduct) {
			return visitor.visitProduct(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class SumContext extends FormulaContext {
	public _op!: Token;
	public formula(): FormulaContext[];
	public formula(i: number): FormulaContext;
	public formula(i?: number): FormulaContext | FormulaContext[] {
		if (i === undefined) {
			return this.getRuleContexts(FormulaContext);
		} else {
			return this.getRuleContext(i, FormulaContext);
		}
	}
	constructor(ctx: FormulaContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterSum) {
			listener.enterSum(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitSum) {
			listener.exitSum(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitSum) {
			return visitor.visitSum(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class CompareContext extends FormulaContext {
	public _op!: Token;
	public formula(): FormulaContext[];
	public formula(i: number): FormulaContext;
	public formula(i?: number): FormulaContext | FormulaContext[] {
		if (i === undefined) {
			return this.getRuleContexts(FormulaContext);
		} else {
			return this.getRuleContext(i, FormulaContext);
		}
	}
	public COMPARE(): TerminalNode { return this.getToken(AntimonyParser.COMPARE, 0); }
	constructor(ctx: FormulaContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterCompare) {
			listener.enterCompare(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitCompare) {
			listener.exitCompare(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitCompare) {
			return visitor.visitCompare(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class LogicalContext extends FormulaContext {
	public _op!: Token;
	public formula(): FormulaContext[];
	public formula(i: number): FormulaContext;
	public formula(i?: number): FormulaContext | FormulaContext[] {
		if (i === undefined) {
			return this.getRuleContexts(FormulaContext);
		} else {
			return this.getRuleContext(i, FormulaContext);
		}
	}
	public LOGICAL(): TerminalNode { return this.getToken(AntimonyParser.LOGICAL, 0); }
	constructor(ctx: FormulaContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterLogical) {
			listener.enterLogical(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitLogical) {
			listener.exitLogical(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitLogical) {
			return visitor.visitLogical(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class FunctionCallContext extends ParserRuleContext {
	public NAME(): TerminalNode { return this.getToken(AntimonyParser.NAME, 0); }
	public argumentList(): ArgumentListContext | undefined {
		return this.tryGetRuleContext(0, ArgumentListContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return AntimonyParser.RULE_functionCall; }
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterFunctionCall) {
			listener.enterFunctionCall(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitFunctionCall) {
			listener.exitFunctionCall(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitFunctionCall) {
			return visitor.visitFunctionCall(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ArgumentListContext extends ParserRuleContext {
	public formula(): FormulaContext[];
	public formula(i: number): FormulaContext;
	public formula(i?: number): FormulaContext | FormulaContext[] {
		if (i === undefined) {
			return this.getRuleContexts(FormulaContext);
		} else {
			return this.getRuleContext(i, FormulaContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return AntimonyParser.RULE_argumentList; }
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterArgumentList) {
			listener.enterArgumentList(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitArgumentList) {
			listener.exitArgumentList(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitArgumentList) {
			return visitor.visitArgumentList(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class VariableContext extends ParserRuleContext {
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return AntimonyParser.RULE_variable; }
	public copyFrom(ctx: VariableContext): void {
		super.copyFrom(ctx);
	}
}
export class NameContext extends VariableContext {
	public NAME(): TerminalNode { return this.getToken(AntimonyParser.NAME, 0); }
	constructor(ctx: VariableContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterName) {
			listener.enterName(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitName) {
			listener.exitName(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitName) {
			return visitor.visitName(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class SubvariableContext extends VariableContext {
	public variable(): VariableContext {
		return this.getRuleContext(0, VariableContext);
	}
	public NAME(): TerminalNode { return this.getToken(AntimonyParser.NAME, 0); }
	constructor(ctx: VariableContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterSubvariable) {
			listener.enterSubvariable(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitSubvariable) {
			listener.exitSubvariable(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitSubvariable) {
			return visitor.visitSubvariable(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ConstantContext extends VariableContext {
	public variable(): VariableContext {
		return this.getRuleContext(0, VariableContext);
	}
	constructor(ctx: VariableContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterConstant) {
			listener.enterConstant(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitConstant) {
			listener.exitConstant(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitConstant) {
			return visitor.visitConstant(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class InCompartmentContext extends ParserRuleContext {
	public IN(): TerminalNode { return this.getToken(AntimonyParser.IN, 0); }
	public variable(): VariableContext {
		return this.getRuleContext(0, VariableContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return AntimonyParser.RULE_inCompartment; }
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterInCompartment) {
			listener.enterInCompartment(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitInCompartment) {
			listener.exitInCompartment(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitInCompartment) {
			return visitor.visitInCompartment(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class NameLabelContext extends ParserRuleContext {
	public NAME(): TerminalNode[];
	public NAME(i: number): TerminalNode;
	public NAME(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(AntimonyParser.NAME);
		} else {
			return this.getToken(AntimonyParser.NAME, i);
		}
	}
	public inCompartment(): InCompartmentContext | undefined {
		return this.tryGetRuleContext(0, InCompartmentContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return AntimonyParser.RULE_nameLabel; }
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterNameLabel) {
			listener.enterNameLabel(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitNameLabel) {
			listener.exitNameLabel(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitNameLabel) {
			return visitor.visitNameLabel(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ReactionContext extends ParserRuleContext {
	public reactionFormula(): ReactionFormulaContext {
		return this.getRuleContext(0, ReactionFormulaContext);
	}
	public nameLabel(): NameLabelContext | undefined {
		return this.tryGetRuleContext(0, NameLabelContext);
	}
	public formula(): FormulaContext | undefined {
		return this.tryGetRuleContext(0, FormulaContext);
	}
	public inCompartment(): InCompartmentContext | undefined {
		return this.tryGetRuleContext(0, InCompartmentContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return AntimonyParser.RULE_reaction; }
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterReaction) {
			listener.enterReaction(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitReaction) {
			listener.exitReaction(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitReaction) {
			return visitor.visitReaction(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ReactionFormulaContext extends ParserRuleContext {
	public _left!: ReactantListContext;
	public _right!: ReactantListContext;
	public ARROW(): TerminalNode { return this.getToken(AntimonyParser.ARROW, 0); }
	public reactantList(): ReactantListContext[];
	public reactantList(i: number): ReactantListContext;
	public reactantList(i?: number): ReactantListContext | ReactantListContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ReactantListContext);
		} else {
			return this.getRuleContext(i, ReactantListContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return AntimonyParser.RULE_reactionFormula; }
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterReactionFormula) {
			listener.enterReactionFormula(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitReactionFormula) {
			listener.exitReactionFormula(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitReactionFormula) {
			return visitor.visitReactionFormula(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ReactantListContext extends ParserRuleContext {
	public reactant(): ReactantContext[];
	public reactant(i: number): ReactantContext;
	public reactant(i?: number): ReactantContext | ReactantContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ReactantContext);
		} else {
			return this.getRuleContext(i, ReactantContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return AntimonyParser.RULE_reactantList; }
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterReactantList) {
			listener.enterReactantList(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitReactantList) {
			listener.exitReactantList(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitReactantList) {
			return visitor.visitReactantList(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ReactantContext extends ParserRuleContext {
	public variable(): VariableContext {
		return this.getRuleContext(0, VariableContext);
	}
	public stoichiometry(): StoichiometryContext | undefined {
		return this.tryGetRuleContext(0, StoichiometryContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return AntimonyParser.RULE_reactant; }
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterReactant) {
			listener.enterReactant(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitReactant) {
			listener.exitReactant(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitReactant) {
			return visitor.visitReactant(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class StoichiometryContext extends ParserRuleContext {
	public NUMBER(): TerminalNode | undefined { return this.tryGetToken(AntimonyParser.NUMBER, 0); }
	public variable(): VariableContext | undefined {
		return this.tryGetRuleContext(0, VariableContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return AntimonyParser.RULE_stoichiometry; }
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterStoichiometry) {
			listener.enterStoichiometry(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitStoichiometry) {
			listener.exitStoichiometry(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitStoichiometry) {
			return visitor.visitStoichiometry(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class AssignmentContext extends ParserRuleContext {
	public _mod!: Token;
	public variable(): VariableContext {
		return this.getRuleContext(0, VariableContext);
	}
	public inCompartment(): InCompartmentContext | undefined {
		return this.tryGetRuleContext(0, InCompartmentContext);
	}
	public formula(): FormulaContext | undefined {
		return this.tryGetRuleContext(0, FormulaContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return AntimonyParser.RULE_assignment; }
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterAssignment) {
			listener.enterAssignment(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitAssignment) {
			listener.exitAssignment(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitAssignment) {
			return visitor.visitAssignment(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class DeclarationContext extends ParserRuleContext {
	public declarationHead(): DeclarationHeadContext {
		return this.getRuleContext(0, DeclarationHeadContext);
	}
	public declarationTerm(): DeclarationTermContext[];
	public declarationTerm(i: number): DeclarationTermContext;
	public declarationTerm(i?: number): DeclarationTermContext | DeclarationTermContext[] {
		if (i === undefined) {
			return this.getRuleContexts(DeclarationTermContext);
		} else {
			return this.getRuleContext(i, DeclarationTermContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return AntimonyParser.RULE_declaration; }
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterDeclaration) {
			listener.enterDeclaration(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitDeclaration) {
			listener.exitDeclaration(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitDeclaration) {
			return visitor.visitDeclaration(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class DeclarationHeadContext extends ParserRuleContext {
	public CONST_MODIFIER(): TerminalNode | undefined { return this.tryGetToken(AntimonyParser.CONST_MODIFIER, 0); }
	public DECL_WORD(): TerminalNode | undefined { return this.tryGetToken(AntimonyParser.DECL_WORD, 0); }
	public SUBS_ONLY(): TerminalNode | undefined { return this.tryGetToken(AntimonyParser.SUBS_ONLY, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return AntimonyParser.RULE_declarationHead; }
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterDeclarationHead) {
			listener.enterDeclarationHead(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitDeclarationHead) {
			listener.exitDeclarationHead(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitDeclarationHead) {
			return visitor.visitDeclarationHead(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class DeclarationTermContext extends ParserRuleContext {
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return AntimonyParser.RULE_declarationTerm; }
	public copyFrom(ctx: DeclarationTermContext): void {
		super.copyFrom(ctx);
	}
}
export class DeclarationAssignmentContext extends DeclarationTermContext {
	public assignment(): AssignmentContext {
		return this.getRuleContext(0, AssignmentContext);
	}
	constructor(ctx: DeclarationTermContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterDeclarationAssignment) {
			listener.enterDeclarationAssignment(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitDeclarationAssignment) {
			listener.exitDeclarationAssignment(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitDeclarationAssignment) {
			return visitor.visitDeclarationAssignment(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class DeclarationNameContext extends DeclarationTermContext {
	public variable(): VariableContext {
		return this.getRuleContext(0, VariableContext);
	}
	public inCompartment(): InCompartmentContext | undefined {
		return this.tryGetRuleContext(0, InCompartmentContext);
	}
	constructor(ctx: DeclarationTermContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterDeclarationName) {
			listener.enterDeclarationName(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitDeclarationName) {
			listener.exitDeclarationName(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitDeclarationName) {
			return visitor.visitDeclarationName(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class EventContext extends ParserRuleContext {
	public _trigger!: FormulaContext;
	public _delay!: FormulaContext;
	public AT(): TerminalNode { return this.getToken(AntimonyParser.AT, 0); }
	public formula(): FormulaContext[];
	public formula(i: number): FormulaContext;
	public formula(i?: number): FormulaContext | FormulaContext[] {
		if (i === undefined) {
			return this.getRuleContexts(FormulaContext);
		} else {
			return this.getRuleContext(i, FormulaContext);
		}
	}
	public nameLabel(): NameLabelContext | undefined {
		return this.tryGetRuleContext(0, NameLabelContext);
	}
	public eventOptions(): EventOptionsContext | undefined {
		return this.tryGetRuleContext(0, EventOptionsContext);
	}
	public eventAssignments(): EventAssignmentsContext | undefined {
		return this.tryGetRuleContext(0, EventAssignmentsContext);
	}
	public AFTER(): TerminalNode | undefined { return this.tryGetToken(AntimonyParser.AFTER, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return AntimonyParser.RULE_event; }
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterEvent) {
			listener.enterEvent(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitEvent) {
			listener.exitEvent(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitEvent) {
			return visitor.visitEvent(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class EventOptionsContext extends ParserRuleContext {
	public eventOption(): EventOptionContext[];
	public eventOption(i: number): EventOptionContext;
	public eventOption(i?: number): EventOptionContext | EventOptionContext[] {
		if (i === undefined) {
			return this.getRuleContexts(EventOptionContext);
		} else {
			return this.getRuleContext(i, EventOptionContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return AntimonyParser.RULE_eventOptions; }
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterEventOptions) {
			listener.enterEventOptions(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitEventOptions) {
			listener.exitEventOptions(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitEventOptions) {
			return visitor.visitEventOptions(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class EventOptionContext extends ParserRuleContext {
	public NAME(): TerminalNode { return this.getToken(AntimonyParser.NAME, 0); }
	public formula(): FormulaContext {
		return this.getRuleContext(0, FormulaContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return AntimonyParser.RULE_eventOption; }
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterEventOption) {
			listener.enterEventOption(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitEventOption) {
			listener.exitEventOption(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitEventOption) {
			return visitor.visitEventOption(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class EventAssignmentsContext extends ParserRuleContext {
	public eventAssignment(): EventAssignmentContext[];
	public eventAssignment(i: number): EventAssignmentContext;
	public eventAssignment(i?: number): EventAssignmentContext | EventAssignmentContext[] {
		if (i === undefined) {
			return this.getRuleContexts(EventAssignmentContext);
		} else {
			return this.getRuleContext(i, EventAssignmentContext);
		}
	}
	public NEWLINE(): TerminalNode[];
	public NEWLINE(i: number): TerminalNode;
	public NEWLINE(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(AntimonyParser.NEWLINE);
		} else {
			return this.getToken(AntimonyParser.NEWLINE, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return AntimonyParser.RULE_eventAssignments; }
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterEventAssignments) {
			listener.enterEventAssignments(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitEventAssignments) {
			listener.exitEventAssignments(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitEventAssignments) {
			return visitor.visitEventAssignments(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class EventAssignmentContext extends ParserRuleContext {
	public variable(): VariableContext {
		return this.getRuleContext(0, VariableContext);
	}
	public formula(): FormulaContext {
		return this.getRuleContext(0, FormulaContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return AntimonyParser.RULE_eventAssignment; }
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterEventAssignment) {
			listener.enterEventAssignment(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitEventAssignment) {
			listener.exitEventAssignment(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitEventAssignment) {
			return visitor.visitEventAssignment(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class RenameContext extends ParserRuleContext {
	public variable(): VariableContext[];
	public variable(i: number): VariableContext;
	public variable(i?: number): VariableContext | VariableContext[] {
		if (i === undefined) {
			return this.getRuleContexts(VariableContext);
		} else {
			return this.getRuleContext(i, VariableContext);
		}
	}
	public IS(): TerminalNode { return this.getToken(AntimonyParser.IS, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return AntimonyParser.RULE_rename; }
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterRename) {
			listener.enterRename(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitRename) {
			listener.exitRename(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitRename) {
			return visitor.visitRename(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class DeleteContext extends ParserRuleContext {
	public DELETE(): TerminalNode { return this.getToken(AntimonyParser.DELETE, 0); }
	public variable(): VariableContext {
		return this.getRuleContext(0, VariableContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return AntimonyParser.RULE_delete; }
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterDelete) {
			listener.enterDelete(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitDelete) {
			listener.exitDelete(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitDelete) {
			return visitor.visitDelete(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class AnnotationContext extends ParserRuleContext {
	public variableAnnotation(): VariableAnnotationContext | undefined {
		return this.tryGetRuleContext(0, VariableAnnotationContext);
	}
	public hasAnnotation(): HasAnnotationContext | undefined {
		return this.tryGetRuleContext(0, HasAnnotationContext);
	}
	public modelAnnotation(): ModelAnnotationContext | undefined {
		return this.tryGetRuleContext(0, ModelAnnotationContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return AntimonyParser.RULE_annotation; }
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterAnnotation) {
			listener.enterAnnotation(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitAnnotation) {
			listener.exitAnnotation(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitAnnotation) {
			return visitor.visitAnnotation(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class VariableAnnotationContext extends ParserRuleContext {
	public variable(): VariableContext {
		return this.getRuleContext(0, VariableContext);
	}
	public annotationBody(): AnnotationBodyContext {
		return this.getRuleContext(0, AnnotationBodyContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return AntimonyParser.RULE_variableAnnotation; }
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterVariableAnnotation) {
			listener.enterVariableAnnotation(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitVariableAnnotation) {
			listener.exitVariableAnnotation(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitVariableAnnotation) {
			return visitor.visitVariableAnnotation(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class HasAnnotationContext extends ParserRuleContext {
	public variable(): VariableContext {
		return this.getRuleContext(0, VariableContext);
	}
	public HAS(): TerminalNode { return this.getToken(AntimonyParser.HAS, 0); }
	public unitFormula(): UnitFormulaContext {
		return this.getRuleContext(0, UnitFormulaContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return AntimonyParser.RULE_hasAnnotation; }
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterHasAnnotation) {
			listener.enterHasAnnotation(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitHasAnnotation) {
			listener.exitHasAnnotation(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitHasAnnotation) {
			return visitor.visitHasAnnotation(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ModelAnnotationContext extends ParserRuleContext {
	public MODEL(): TerminalNode { return this.getToken(AntimonyParser.MODEL, 0); }
	public annotationBody(): AnnotationBodyContext {
		return this.getRuleContext(0, AnnotationBodyContext);
	}
	public NAME(): TerminalNode | undefined { return this.tryGetToken(AntimonyParser.NAME, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return AntimonyParser.RULE_modelAnnotation; }
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterModelAnnotation) {
			listener.enterModelAnnotation(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitModelAnnotation) {
			listener.exitModelAnnotation(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitModelAnnotation) {
			return visitor.visitModelAnnotation(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class AnnotationBodyContext extends ParserRuleContext {
	public annotationItem(): AnnotationItemContext {
		return this.getRuleContext(0, AnnotationItemContext);
	}
	public string(): StringContext[];
	public string(i: number): StringContext;
	public string(i?: number): StringContext | StringContext[] {
		if (i === undefined) {
			return this.getRuleContexts(StringContext);
		} else {
			return this.getRuleContext(i, StringContext);
		}
	}
	public NEWLINE(): TerminalNode[];
	public NEWLINE(i: number): TerminalNode;
	public NEWLINE(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(AntimonyParser.NEWLINE);
		} else {
			return this.getToken(AntimonyParser.NEWLINE, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return AntimonyParser.RULE_annotationBody; }
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterAnnotationBody) {
			listener.enterAnnotationBody(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitAnnotationBody) {
			listener.exitAnnotationBody(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitAnnotationBody) {
			return visitor.visitAnnotationBody(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class AnnotationItemContext extends ParserRuleContext {
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return AntimonyParser.RULE_annotationItem; }
	public copyFrom(ctx: AnnotationItemContext): void {
		super.copyFrom(ctx);
	}
}
export class AnnotationIsContext extends AnnotationItemContext {
	public IS(): TerminalNode { return this.getToken(AntimonyParser.IS, 0); }
	constructor(ctx: AnnotationItemContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterAnnotationIs) {
			listener.enterAnnotationIs(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitAnnotationIs) {
			listener.exitAnnotationIs(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitAnnotationIs) {
			return visitor.visitAnnotationIs(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class AnnotationNameContext extends AnnotationItemContext {
	public NAME(): TerminalNode { return this.getToken(AntimonyParser.NAME, 0); }
	constructor(ctx: AnnotationItemContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterAnnotationName) {
			listener.enterAnnotationName(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitAnnotationName) {
			listener.exitAnnotationName(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitAnnotationName) {
			return visitor.visitAnnotationName(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class AnnotationSubItemContext extends AnnotationItemContext {
	public NAME(): TerminalNode { return this.getToken(AntimonyParser.NAME, 0); }
	public annotationItem(): AnnotationItemContext {
		return this.getRuleContext(0, AnnotationItemContext);
	}
	constructor(ctx: AnnotationItemContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterAnnotationSubItem) {
			listener.enterAnnotationSubItem(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitAnnotationSubItem) {
			listener.exitAnnotationSubItem(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitAnnotationSubItem) {
			return visitor.visitAnnotationSubItem(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class StringContext extends ParserRuleContext {
	public STRING(): TerminalNode | undefined { return this.tryGetToken(AntimonyParser.STRING, 0); }
	public LONG_STRING(): TerminalNode | undefined { return this.tryGetToken(AntimonyParser.LONG_STRING, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return AntimonyParser.RULE_string; }
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterString) {
			listener.enterString(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitString) {
			listener.exitString(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitString) {
			return visitor.visitString(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class UnitDeclarationContext extends ParserRuleContext {
	public UNIT(): TerminalNode { return this.getToken(AntimonyParser.UNIT, 0); }
	public NAME(): TerminalNode { return this.getToken(AntimonyParser.NAME, 0); }
	public unitFormula(): UnitFormulaContext | undefined {
		return this.tryGetRuleContext(0, UnitFormulaContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return AntimonyParser.RULE_unitDeclaration; }
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterUnitDeclaration) {
			listener.enterUnitDeclaration(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitUnitDeclaration) {
			listener.exitUnitDeclaration(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitUnitDeclaration) {
			return visitor.visitUnitDeclaration(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class UnitFormulaContext extends ParserRuleContext {
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return AntimonyParser.RULE_unitFormula; }
	public copyFrom(ctx: UnitFormulaContext): void {
		super.copyFrom(ctx);
	}
}
export class UnitGroupContext extends UnitFormulaContext {
	public unitFormula(): UnitFormulaContext {
		return this.getRuleContext(0, UnitFormulaContext);
	}
	constructor(ctx: UnitFormulaContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterUnitGroup) {
			listener.enterUnitGroup(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitUnitGroup) {
			listener.exitUnitGroup(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitUnitGroup) {
			return visitor.visitUnitGroup(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class UnitNumberContext extends UnitFormulaContext {
	public _unit!: Token;
	public NUMBER(): TerminalNode { return this.getToken(AntimonyParser.NUMBER, 0); }
	public NAME(): TerminalNode | undefined { return this.tryGetToken(AntimonyParser.NAME, 0); }
	constructor(ctx: UnitFormulaContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterUnitNumber) {
			listener.enterUnitNumber(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitUnitNumber) {
			listener.exitUnitNumber(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitUnitNumber) {
			return visitor.visitUnitNumber(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class UnitNameContext extends UnitFormulaContext {
	public NAME(): TerminalNode | undefined { return this.tryGetToken(AntimonyParser.NAME, 0); }
	public string(): StringContext | undefined {
		return this.tryGetRuleContext(0, StringContext);
	}
	constructor(ctx: UnitFormulaContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterUnitName) {
			listener.enterUnitName(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitUnitName) {
			listener.exitUnitName(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitUnitName) {
			return visitor.visitUnitName(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class UnitPositiveContext extends UnitFormulaContext {
	public unitFormula(): UnitFormulaContext {
		return this.getRuleContext(0, UnitFormulaContext);
	}
	constructor(ctx: UnitFormulaContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterUnitPositive) {
			listener.enterUnitPositive(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitUnitPositive) {
			listener.exitUnitPositive(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitUnitPositive) {
			return visitor.visitUnitPositive(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class UnitNegativeContext extends UnitFormulaContext {
	public unitFormula(): UnitFormulaContext {
		return this.getRuleContext(0, UnitFormulaContext);
	}
	constructor(ctx: UnitFormulaContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterUnitNegative) {
			listener.enterUnitNegative(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitUnitNegative) {
			listener.exitUnitNegative(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitUnitNegative) {
			return visitor.visitUnitNegative(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class UnitPowerContext extends UnitFormulaContext {
	public unitFormula(): UnitFormulaContext[];
	public unitFormula(i: number): UnitFormulaContext;
	public unitFormula(i?: number): UnitFormulaContext | UnitFormulaContext[] {
		if (i === undefined) {
			return this.getRuleContexts(UnitFormulaContext);
		} else {
			return this.getRuleContext(i, UnitFormulaContext);
		}
	}
	constructor(ctx: UnitFormulaContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterUnitPower) {
			listener.enterUnitPower(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitUnitPower) {
			listener.exitUnitPower(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitUnitPower) {
			return visitor.visitUnitPower(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class UnitProductContext extends UnitFormulaContext {
	public _op!: Token;
	public unitFormula(): UnitFormulaContext[];
	public unitFormula(i: number): UnitFormulaContext;
	public unitFormula(i?: number): UnitFormulaContext | UnitFormulaContext[] {
		if (i === undefined) {
			return this.getRuleContexts(UnitFormulaContext);
		} else {
			return this.getRuleContext(i, UnitFormulaContext);
		}
	}
	constructor(ctx: UnitFormulaContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterUnitProduct) {
			listener.enterUnitProduct(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitUnitProduct) {
			listener.exitUnitProduct(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitUnitProduct) {
			return visitor.visitUnitProduct(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class UnitSumContext extends UnitFormulaContext {
	public _op!: Token;
	public unitFormula(): UnitFormulaContext[];
	public unitFormula(i: number): UnitFormulaContext;
	public unitFormula(i?: number): UnitFormulaContext | UnitFormulaContext[] {
		if (i === undefined) {
			return this.getRuleContexts(UnitFormulaContext);
		} else {
			return this.getRuleContext(i, UnitFormulaContext);
		}
	}
	constructor(ctx: UnitFormulaContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterUnitSum) {
			listener.enterUnitSum(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitUnitSum) {
			listener.exitUnitSum(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitUnitSum) {
			return visitor.visitUnitSum(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class InStatementContext extends ParserRuleContext {
	public variable(): VariableContext {
		return this.getRuleContext(0, VariableContext);
	}
	public inCompartment(): InCompartmentContext {
		return this.getRuleContext(0, InCompartmentContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return AntimonyParser.RULE_inStatement; }
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterInStatement) {
			listener.enterInStatement(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitInStatement) {
			listener.exitInStatement(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitInStatement) {
			return visitor.visitInStatement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ModelImportContext extends ParserRuleContext {
	public NAME(): TerminalNode { return this.getToken(AntimonyParser.NAME, 0); }
	public exportList(): ExportListContext {
		return this.getRuleContext(0, ExportListContext);
	}
	public nameLabel(): NameLabelContext | undefined {
		return this.tryGetRuleContext(0, NameLabelContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return AntimonyParser.RULE_modelImport; }
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterModelImport) {
			listener.enterModelImport(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitModelImport) {
			listener.exitModelImport(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitModelImport) {
			return visitor.visitModelImport(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


