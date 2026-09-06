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
	public static readonly RULE_algebraicRule = 29;
	public static readonly RULE_rename = 30;
	public static readonly RULE_conversionFactorLeft = 31;
	public static readonly RULE_conversionFactorRight = 32;
	public static readonly RULE_delete = 33;
	public static readonly RULE_annotation = 34;
	public static readonly RULE_variableAnnotation = 35;
	public static readonly RULE_hasAnnotation = 36;
	public static readonly RULE_modelAnnotation = 37;
	public static readonly RULE_annotationBody = 38;
	public static readonly RULE_annotationItem = 39;
	public static readonly RULE_string = 40;
	public static readonly RULE_unitDeclaration = 41;
	public static readonly RULE_unitFormula = 42;
	public static readonly RULE_inStatement = 43;
	public static readonly RULE_modelImport = 44;
	public static readonly RULE_modelImportOption = 45;
	public static readonly RULE_modelImportValue = 46;
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"root", "statementSeparator", "topLevelStatement", "statementList", "statement", 
		"model", "exportList", "functionDefinition", "parameterList", "formula", 
		"functionCall", "argumentList", "variable", "inCompartment", "nameLabel", 
		"reaction", "reactionFormula", "reactantList", "reactant", "stoichiometry", 
		"assignment", "declaration", "declarationHead", "declarationTerm", "event", 
		"eventOptions", "eventOption", "eventAssignments", "eventAssignment", 
		"algebraicRule", "rename", "conversionFactorLeft", "conversionFactorRight", 
		"delete", "annotation", "variableAnnotation", "hasAnnotation", "modelAnnotation", 
		"annotationBody", "annotationItem", "string", "unitDeclaration", "unitFormula", 
		"inStatement", "modelImport", "modelImportOption", "modelImportValue",
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
			this.state = 95;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (((((_la - 8)) & ~0x1F) === 0 && ((1 << (_la - 8)) & ((1 << (AntimonyParser.T__7 - 8)) | (1 << (AntimonyParser.T__12 - 8)) | (1 << (AntimonyParser.MODEL - 8)) | (1 << (AntimonyParser.FUNCTION - 8)) | (1 << (AntimonyParser.AT - 8)) | (1 << (AntimonyParser.UNIT - 8)) | (1 << (AntimonyParser.SUBS_ONLY - 8)) | (1 << (AntimonyParser.DELETE - 8)) | (1 << (AntimonyParser.CONST_MODIFIER - 8)) | (1 << (AntimonyParser.DECL_WORD - 8)) | (1 << (AntimonyParser.NAME - 8)) | (1 << (AntimonyParser.NUMBER - 8)) | (1 << (AntimonyParser.ARROW - 8)))) !== 0)) {
				{
				this.state = 94;
				this.topLevelStatement();
				}
			}

			this.state = 103;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === AntimonyParser.T__0 || _la === AntimonyParser.NEWLINE) {
				{
				{
				this.state = 97;
				this.statementSeparator();
				this.state = 99;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (((((_la - 8)) & ~0x1F) === 0 && ((1 << (_la - 8)) & ((1 << (AntimonyParser.T__7 - 8)) | (1 << (AntimonyParser.T__12 - 8)) | (1 << (AntimonyParser.MODEL - 8)) | (1 << (AntimonyParser.FUNCTION - 8)) | (1 << (AntimonyParser.AT - 8)) | (1 << (AntimonyParser.UNIT - 8)) | (1 << (AntimonyParser.SUBS_ONLY - 8)) | (1 << (AntimonyParser.DELETE - 8)) | (1 << (AntimonyParser.CONST_MODIFIER - 8)) | (1 << (AntimonyParser.DECL_WORD - 8)) | (1 << (AntimonyParser.NAME - 8)) | (1 << (AntimonyParser.NUMBER - 8)) | (1 << (AntimonyParser.ARROW - 8)))) !== 0)) {
					{
					this.state = 98;
					this.topLevelStatement();
					}
				}

				}
				}
				this.state = 105;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 106;
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
			this.state = 108;
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
			this.state = 113;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 3, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 110;
				this.model();
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 111;
				this.functionDefinition();
				}
				break;

			case 3:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 112;
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
			this.state = 119;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			do {
				{
				{
				this.state = 116;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (((((_la - 8)) & ~0x1F) === 0 && ((1 << (_la - 8)) & ((1 << (AntimonyParser.T__7 - 8)) | (1 << (AntimonyParser.T__12 - 8)) | (1 << (AntimonyParser.MODEL - 8)) | (1 << (AntimonyParser.AT - 8)) | (1 << (AntimonyParser.UNIT - 8)) | (1 << (AntimonyParser.SUBS_ONLY - 8)) | (1 << (AntimonyParser.DELETE - 8)) | (1 << (AntimonyParser.CONST_MODIFIER - 8)) | (1 << (AntimonyParser.DECL_WORD - 8)) | (1 << (AntimonyParser.NAME - 8)) | (1 << (AntimonyParser.NUMBER - 8)) | (1 << (AntimonyParser.ARROW - 8)))) !== 0)) {
					{
					this.state = 115;
					this.statement();
					}
				}

				this.state = 118;
				this.statementSeparator();
				}
				}
				this.state = 121;
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
			this.state = 134;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 6, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 123;
				this.reaction();
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 124;
				this.assignment();
				}
				break;

			case 3:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 125;
				this.declaration();
				}
				break;

			case 4:
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 126;
				this.modelImport();
				}
				break;

			case 5:
				this.enterOuterAlt(_localctx, 5);
				{
				this.state = 127;
				this.event();
				}
				break;

			case 6:
				this.enterOuterAlt(_localctx, 6);
				{
				this.state = 128;
				this.algebraicRule();
				}
				break;

			case 7:
				this.enterOuterAlt(_localctx, 7);
				{
				this.state = 129;
				this.annotation();
				}
				break;

			case 8:
				this.enterOuterAlt(_localctx, 8);
				{
				this.state = 130;
				this.unitDeclaration();
				}
				break;

			case 9:
				this.enterOuterAlt(_localctx, 9);
				{
				this.state = 131;
				this.inStatement();
				}
				break;

			case 10:
				this.enterOuterAlt(_localctx, 10);
				{
				this.state = 132;
				this.rename();
				}
				break;

			case 11:
				this.enterOuterAlt(_localctx, 11);
				{
				this.state = 133;
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
			this.state = 136;
			this.match(AntimonyParser.MODEL);
			this.state = 138;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === AntimonyParser.T__1) {
				{
				this.state = 137;
				_localctx._star = this.match(AntimonyParser.T__1);
				}
			}

			this.state = 140;
			this.match(AntimonyParser.NAME);
			this.state = 142;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === AntimonyParser.T__2) {
				{
				this.state = 141;
				this.exportList();
				}
			}

			this.state = 144;
			this.statementList();
			this.state = 145;
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
			this.state = 147;
			this.match(AntimonyParser.T__2);
			this.state = 156;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === AntimonyParser.T__12 || _la === AntimonyParser.NAME) {
				{
				this.state = 148;
				this.variable(0);
				this.state = 153;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === AntimonyParser.T__3) {
					{
					{
					this.state = 149;
					this.match(AntimonyParser.T__3);
					this.state = 150;
					this.variable(0);
					}
					}
					this.state = 155;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				}
			}

			this.state = 158;
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
			this.state = 160;
			this.match(AntimonyParser.FUNCTION);
			this.state = 161;
			this.match(AntimonyParser.NAME);
			this.state = 162;
			this.parameterList();
			this.state = 166;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === AntimonyParser.T__0 || _la === AntimonyParser.NEWLINE) {
				{
				{
				this.state = 163;
				this.statementSeparator();
				}
				}
				this.state = 168;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 169;
			this.formula(0);
			this.state = 173;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === AntimonyParser.T__0 || _la === AntimonyParser.NEWLINE) {
				{
				{
				this.state = 170;
				this.statementSeparator();
				}
				}
				this.state = 175;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 176;
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
			this.state = 178;
			this.match(AntimonyParser.T__2);
			this.state = 187;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === AntimonyParser.NAME) {
				{
				this.state = 179;
				this.match(AntimonyParser.NAME);
				this.state = 184;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === AntimonyParser.T__3) {
					{
					{
					this.state = 180;
					this.match(AntimonyParser.T__3);
					this.state = 181;
					this.match(AntimonyParser.NAME);
					}
					}
					this.state = 186;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				}
			}

			this.state = 189;
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
			this.state = 205;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 15, this._ctx) ) {
			case 1:
				{
				_localctx = new GroupContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;

				this.state = 192;
				this.match(AntimonyParser.T__2);
				this.state = 193;
				this.formula(0);
				this.state = 194;
				this.match(AntimonyParser.T__4);
				}
				break;

			case 2:
				{
				_localctx = new NumberContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 196;
				this.match(AntimonyParser.NUMBER);
				}
				break;

			case 3:
				{
				_localctx = new CallContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 197;
				this.functionCall();
				}
				break;

			case 4:
				{
				_localctx = new VarContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 198;
				this.variable(0);
				}
				break;

			case 5:
				{
				_localctx = new PositiveContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 199;
				this.match(AntimonyParser.T__6);
				this.state = 200;
				this.formula(7);
				}
				break;

			case 6:
				{
				_localctx = new NegativeContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 201;
				this.match(AntimonyParser.T__7);
				this.state = 202;
				this.formula(6);
				}
				break;

			case 7:
				{
				_localctx = new NotContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 203;
				this.match(AntimonyParser.T__8);
				this.state = 204;
				this.formula(5);
				}
				break;
			}
			this._ctx._stop = this._input.tryLT(-1);
			this.state = 224;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 17, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = _localctx;
					{
					this.state = 222;
					this._errHandler.sync(this);
					switch ( this.interpreter.adaptivePredict(this._input, 16, this._ctx) ) {
					case 1:
						{
						_localctx = new PowerContext(new FormulaContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, AntimonyParser.RULE_formula);
						this.state = 207;
						if (!(this.precpred(this._ctx, 8))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 8)");
						}
						this.state = 208;
						this.match(AntimonyParser.T__5);
						this.state = 209;
						this.formula(8);
						}
						break;

					case 2:
						{
						_localctx = new ProductContext(new FormulaContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, AntimonyParser.RULE_formula);
						this.state = 210;
						if (!(this.precpred(this._ctx, 4))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 4)");
						}
						this.state = 211;
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
						this.state = 212;
						this.formula(5);
						}
						break;

					case 3:
						{
						_localctx = new SumContext(new FormulaContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, AntimonyParser.RULE_formula);
						this.state = 213;
						if (!(this.precpred(this._ctx, 3))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 3)");
						}
						this.state = 214;
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
						this.state = 215;
						this.formula(4);
						}
						break;

					case 4:
						{
						_localctx = new CompareContext(new FormulaContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, AntimonyParser.RULE_formula);
						this.state = 216;
						if (!(this.precpred(this._ctx, 2))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 2)");
						}
						this.state = 217;
						(_localctx as CompareContext)._op = this.match(AntimonyParser.COMPARE);
						this.state = 218;
						this.formula(3);
						}
						break;

					case 5:
						{
						_localctx = new LogicalContext(new FormulaContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, AntimonyParser.RULE_formula);
						this.state = 219;
						if (!(this.precpred(this._ctx, 1))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 1)");
						}
						this.state = 220;
						(_localctx as LogicalContext)._op = this.match(AntimonyParser.LOGICAL);
						this.state = 221;
						this.formula(2);
						}
						break;
					}
					}
				}
				this.state = 226;
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
			this.state = 227;
			this.match(AntimonyParser.NAME);
			this.state = 228;
			this.match(AntimonyParser.T__2);
			this.state = 230;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << AntimonyParser.T__2) | (1 << AntimonyParser.T__6) | (1 << AntimonyParser.T__7) | (1 << AntimonyParser.T__8) | (1 << AntimonyParser.T__12) | (1 << AntimonyParser.NAME) | (1 << AntimonyParser.NUMBER))) !== 0)) {
				{
				this.state = 229;
				this.argumentList();
				}
			}

			this.state = 232;
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
			this.state = 234;
			this.formula(0);
			this.state = 239;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === AntimonyParser.T__3) {
				{
				{
				this.state = 235;
				this.match(AntimonyParser.T__3);
				this.state = 236;
				this.formula(0);
				}
				}
				this.state = 241;
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
			this.state = 246;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case AntimonyParser.NAME:
				{
				_localctx = new NameContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;

				this.state = 243;
				this.match(AntimonyParser.NAME);
				}
				break;
			case AntimonyParser.T__12:
				{
				_localctx = new ConstantContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 244;
				this.match(AntimonyParser.T__12);
				this.state = 245;
				this.variable(1);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			this._ctx._stop = this._input.tryLT(-1);
			this.state = 253;
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
					this.state = 248;
					if (!(this.precpred(this._ctx, 2))) {
						throw this.createFailedPredicateException("this.precpred(this._ctx, 2)");
					}
					this.state = 249;
					this.match(AntimonyParser.T__11);
					this.state = 250;
					this.match(AntimonyParser.NAME);
					}
					}
				}
				this.state = 255;
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
			this.state = 256;
			this.match(AntimonyParser.IN);
			this.state = 257;
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
			this.state = 259;
			this.match(AntimonyParser.NAME);
			this.state = 264;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === AntimonyParser.T__11) {
				{
				{
				this.state = 260;
				this.match(AntimonyParser.T__11);
				this.state = 261;
				this.match(AntimonyParser.NAME);
				}
				}
				this.state = 266;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 268;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === AntimonyParser.IN) {
				{
				this.state = 267;
				this.inCompartment();
				}
			}

			this.state = 270;
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
			this.state = 273;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 24, this._ctx) ) {
			case 1:
				{
				this.state = 272;
				this.nameLabel();
				}
				break;
			}
			this.state = 275;
			this.reactionFormula();
			this.state = 276;
			this.match(AntimonyParser.T__0);
			this.state = 278;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << AntimonyParser.T__2) | (1 << AntimonyParser.T__6) | (1 << AntimonyParser.T__7) | (1 << AntimonyParser.T__8) | (1 << AntimonyParser.T__12) | (1 << AntimonyParser.NAME) | (1 << AntimonyParser.NUMBER))) !== 0)) {
				{
				this.state = 277;
				this.formula(0);
				}
			}

			this.state = 281;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === AntimonyParser.IN) {
				{
				this.state = 280;
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
			this.state = 284;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << AntimonyParser.T__7) | (1 << AntimonyParser.T__12) | (1 << AntimonyParser.NAME) | (1 << AntimonyParser.NUMBER))) !== 0)) {
				{
				this.state = 283;
				_localctx._left = this.reactantList();
				}
			}

			this.state = 286;
			this.match(AntimonyParser.ARROW);
			this.state = 288;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << AntimonyParser.T__7) | (1 << AntimonyParser.T__12) | (1 << AntimonyParser.NAME) | (1 << AntimonyParser.NUMBER))) !== 0)) {
				{
				this.state = 287;
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
			this.state = 290;
			this.reactant();
			this.state = 295;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === AntimonyParser.T__6) {
				{
				{
				this.state = 291;
				this.match(AntimonyParser.T__6);
				this.state = 292;
				this.reactant();
				}
				}
				this.state = 297;
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
			this.state = 299;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 30, this._ctx) ) {
			case 1:
				{
				this.state = 298;
				this.stoichiometry();
				}
				break;
			}
			this.state = 301;
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
			this.state = 308;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case AntimonyParser.T__7:
			case AntimonyParser.NUMBER:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 304;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === AntimonyParser.T__7) {
					{
					this.state = 303;
					this.match(AntimonyParser.T__7);
					}
				}

				this.state = 306;
				this.match(AntimonyParser.NUMBER);
				}
				break;
			case AntimonyParser.T__12:
			case AntimonyParser.NAME:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 307;
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
			this.state = 310;
			this.variable(0);
			this.state = 312;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === AntimonyParser.IN) {
				{
				this.state = 311;
				this.inCompartment();
				}
			}

			this.state = 315;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === AntimonyParser.T__13 || _la === AntimonyParser.T__14) {
				{
				this.state = 314;
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

			this.state = 317;
			this.match(AntimonyParser.T__15);
			this.state = 319;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << AntimonyParser.T__2) | (1 << AntimonyParser.T__6) | (1 << AntimonyParser.T__7) | (1 << AntimonyParser.T__8) | (1 << AntimonyParser.T__12) | (1 << AntimonyParser.NAME) | (1 << AntimonyParser.NUMBER))) !== 0)) {
				{
				this.state = 318;
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
			this.state = 321;
			this.declarationHead();
			this.state = 322;
			this.declarationTerm();
			this.state = 327;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === AntimonyParser.T__3) {
				{
				{
				this.state = 323;
				this.match(AntimonyParser.T__3);
				this.state = 324;
				this.declarationTerm();
				}
				}
				this.state = 329;
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
			this.state = 344;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 40, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 330;
				this.match(AntimonyParser.CONST_MODIFIER);
				this.state = 332;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === AntimonyParser.SUBS_ONLY) {
					{
					this.state = 331;
					this.match(AntimonyParser.SUBS_ONLY);
					}
				}

				this.state = 334;
				this.match(AntimonyParser.DECL_WORD);
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 335;
				this.match(AntimonyParser.CONST_MODIFIER);
				this.state = 337;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === AntimonyParser.SUBS_ONLY) {
					{
					this.state = 336;
					this.match(AntimonyParser.SUBS_ONLY);
					}
				}

				}
				break;

			case 3:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 340;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === AntimonyParser.SUBS_ONLY) {
					{
					this.state = 339;
					this.match(AntimonyParser.SUBS_ONLY);
					}
				}

				this.state = 342;
				this.match(AntimonyParser.DECL_WORD);
				}
				break;

			case 4:
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 343;
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
			this.state = 351;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 42, this._ctx) ) {
			case 1:
				_localctx = new DeclarationAssignmentContext(_localctx);
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 346;
				this.assignment();
				}
				break;

			case 2:
				_localctx = new DeclarationNameContext(_localctx);
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 347;
				this.variable(0);
				this.state = 349;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === AntimonyParser.IN) {
					{
					this.state = 348;
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
			this.state = 379;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 49, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 354;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === AntimonyParser.NAME) {
					{
					this.state = 353;
					this.nameLabel();
					}
				}

				this.state = 356;
				this.match(AntimonyParser.AT);
				this.state = 357;
				_localctx._trigger = this.formula(0);
				this.state = 359;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === AntimonyParser.T__3) {
					{
					this.state = 358;
					this.eventOptions();
					}
				}

				this.state = 361;
				this.match(AntimonyParser.T__13);
				this.state = 363;
				this._errHandler.sync(this);
				switch ( this.interpreter.adaptivePredict(this._input, 45, this._ctx) ) {
				case 1:
					{
					this.state = 362;
					this.eventAssignments();
					}
					break;
				}
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 366;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === AntimonyParser.NAME) {
					{
					this.state = 365;
					this.nameLabel();
					}
				}

				this.state = 368;
				this.match(AntimonyParser.AT);
				this.state = 369;
				_localctx._delay = this.formula(0);
				this.state = 370;
				this.match(AntimonyParser.AFTER);
				this.state = 371;
				_localctx._trigger = this.formula(0);
				this.state = 373;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === AntimonyParser.T__3) {
					{
					this.state = 372;
					this.eventOptions();
					}
				}

				this.state = 375;
				this.match(AntimonyParser.T__13);
				this.state = 377;
				this._errHandler.sync(this);
				switch ( this.interpreter.adaptivePredict(this._input, 48, this._ctx) ) {
				case 1:
					{
					this.state = 376;
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
			this.state = 383;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			do {
				{
				{
				this.state = 381;
				this.match(AntimonyParser.T__3);
				this.state = 382;
				this.eventOption();
				}
				}
				this.state = 385;
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
			this.state = 387;
			this.match(AntimonyParser.NAME);
			this.state = 388;
			this.match(AntimonyParser.T__15);
			this.state = 389;
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
			this.state = 394;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === AntimonyParser.NEWLINE) {
				{
				{
				this.state = 391;
				this.match(AntimonyParser.NEWLINE);
				}
				}
				this.state = 396;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 397;
			this.eventAssignment();
			this.state = 408;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === AntimonyParser.T__3) {
				{
				{
				this.state = 398;
				this.match(AntimonyParser.T__3);
				this.state = 402;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === AntimonyParser.NEWLINE) {
					{
					{
					this.state = 399;
					this.match(AntimonyParser.NEWLINE);
					}
					}
					this.state = 404;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 405;
				this.eventAssignment();
				}
				}
				this.state = 410;
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
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 411;
			this.variable(0);
			this.state = 412;
			this.match(AntimonyParser.T__15);
			this.state = 414;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << AntimonyParser.T__2) | (1 << AntimonyParser.T__6) | (1 << AntimonyParser.T__7) | (1 << AntimonyParser.T__8) | (1 << AntimonyParser.T__12) | (1 << AntimonyParser.NAME) | (1 << AntimonyParser.NUMBER))) !== 0)) {
				{
				this.state = 413;
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
	public algebraicRule(): AlgebraicRuleContext {
		let _localctx: AlgebraicRuleContext = new AlgebraicRuleContext(this._ctx, this.state);
		this.enterRule(_localctx, 58, AntimonyParser.RULE_algebraicRule);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 417;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === AntimonyParser.NAME) {
				{
				this.state = 416;
				this.nameLabel();
				}
			}

			this.state = 419;
			this.match(AntimonyParser.NUMBER);
			this.state = 420;
			this.match(AntimonyParser.T__15);
			this.state = 421;
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
		this.enterRule(_localctx, 60, AntimonyParser.RULE_rename);
		let _la: number;
		try {
			this.state = 436;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 58, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 423;
				this.variable(0);
				this.state = 425;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === AntimonyParser.T__1) {
					{
					this.state = 424;
					this.conversionFactorLeft();
					}
				}

				this.state = 427;
				this.match(AntimonyParser.IS);
				this.state = 428;
				this.variable(0);
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 430;
				this.variable(0);
				this.state = 431;
				this.match(AntimonyParser.IS);
				this.state = 432;
				this.variable(0);
				this.state = 434;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === AntimonyParser.T__9) {
					{
					this.state = 433;
					this.conversionFactorRight();
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
	public conversionFactorLeft(): ConversionFactorLeftContext {
		let _localctx: ConversionFactorLeftContext = new ConversionFactorLeftContext(this._ctx, this.state);
		this.enterRule(_localctx, 62, AntimonyParser.RULE_conversionFactorLeft);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 438;
			this.match(AntimonyParser.T__1);
			this.state = 439;
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
	public conversionFactorRight(): ConversionFactorRightContext {
		let _localctx: ConversionFactorRightContext = new ConversionFactorRightContext(this._ctx, this.state);
		this.enterRule(_localctx, 64, AntimonyParser.RULE_conversionFactorRight);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 441;
			this.match(AntimonyParser.T__9);
			this.state = 442;
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
		this.enterRule(_localctx, 66, AntimonyParser.RULE_delete);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 444;
			this.match(AntimonyParser.DELETE);
			this.state = 445;
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
		this.enterRule(_localctx, 68, AntimonyParser.RULE_annotation);
		try {
			this.state = 450;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 59, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 447;
				this.variableAnnotation();
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 448;
				this.hasAnnotation();
				}
				break;

			case 3:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 449;
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
		this.enterRule(_localctx, 70, AntimonyParser.RULE_variableAnnotation);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 452;
			this.variable(0);
			this.state = 453;
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
		this.enterRule(_localctx, 72, AntimonyParser.RULE_hasAnnotation);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 455;
			this.variable(0);
			this.state = 456;
			this.match(AntimonyParser.HAS);
			this.state = 457;
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
		this.enterRule(_localctx, 74, AntimonyParser.RULE_modelAnnotation);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 459;
			this.match(AntimonyParser.MODEL);
			this.state = 461;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 60, this._ctx) ) {
			case 1:
				{
				this.state = 460;
				this.match(AntimonyParser.NAME);
				}
				break;
			}
			this.state = 463;
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
		this.enterRule(_localctx, 76, AntimonyParser.RULE_annotationBody);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 465;
			this.annotationItem();
			this.state = 466;
			this.string();
			this.state = 474;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === AntimonyParser.T__3) {
				{
				{
				this.state = 467;
				this.match(AntimonyParser.T__3);
				this.state = 469;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === AntimonyParser.NEWLINE) {
					{
					this.state = 468;
					this.match(AntimonyParser.NEWLINE);
					}
				}

				this.state = 471;
				this.string();
				}
				}
				this.state = 476;
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
		this.enterRule(_localctx, 78, AntimonyParser.RULE_annotationItem);
		try {
			this.state = 482;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 63, this._ctx) ) {
			case 1:
				_localctx = new AnnotationIsContext(_localctx);
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 477;
				this.match(AntimonyParser.IS);
				}
				break;

			case 2:
				_localctx = new AnnotationNameContext(_localctx);
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 478;
				this.match(AntimonyParser.NAME);
				}
				break;

			case 3:
				_localctx = new AnnotationSubItemContext(_localctx);
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 479;
				this.match(AntimonyParser.NAME);
				this.state = 480;
				this.match(AntimonyParser.T__11);
				this.state = 481;
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
		this.enterRule(_localctx, 80, AntimonyParser.RULE_string);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 484;
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
		this.enterRule(_localctx, 82, AntimonyParser.RULE_unitDeclaration);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 486;
			this.match(AntimonyParser.UNIT);
			this.state = 487;
			this.match(AntimonyParser.NAME);
			this.state = 490;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === AntimonyParser.T__15) {
				{
				this.state = 488;
				this.match(AntimonyParser.T__15);
				this.state = 489;
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
		let _startState: number = 84;
		this.enterRecursionRule(_localctx, 84, AntimonyParser.RULE_unitFormula, _p);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 507;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case AntimonyParser.T__2:
				{
				_localctx = new UnitGroupContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;

				this.state = 493;
				this.match(AntimonyParser.T__2);
				this.state = 494;
				this.unitFormula(0);
				this.state = 495;
				this.match(AntimonyParser.T__4);
				}
				break;
			case AntimonyParser.NUMBER:
				{
				_localctx = new UnitNumberContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 497;
				this.match(AntimonyParser.NUMBER);
				this.state = 499;
				this._errHandler.sync(this);
				switch ( this.interpreter.adaptivePredict(this._input, 65, this._ctx) ) {
				case 1:
					{
					this.state = 498;
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
				this.state = 501;
				this.match(AntimonyParser.NAME);
				}
				break;
			case AntimonyParser.STRING:
			case AntimonyParser.LONG_STRING:
				{
				_localctx = new UnitNameContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 502;
				this.string();
				}
				break;
			case AntimonyParser.T__6:
				{
				_localctx = new UnitPositiveContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 503;
				this.match(AntimonyParser.T__6);
				this.state = 504;
				this.unitFormula(5);
				}
				break;
			case AntimonyParser.T__7:
				{
				_localctx = new UnitNegativeContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 505;
				this.match(AntimonyParser.T__7);
				this.state = 506;
				this.unitFormula(4);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			this._ctx._stop = this._input.tryLT(-1);
			this.state = 520;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 68, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = _localctx;
					{
					this.state = 518;
					this._errHandler.sync(this);
					switch ( this.interpreter.adaptivePredict(this._input, 67, this._ctx) ) {
					case 1:
						{
						_localctx = new UnitPowerContext(new UnitFormulaContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, AntimonyParser.RULE_unitFormula);
						this.state = 509;
						if (!(this.precpred(this._ctx, 3))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 3)");
						}
						this.state = 510;
						this.match(AntimonyParser.T__5);
						this.state = 511;
						this.unitFormula(3);
						}
						break;

					case 2:
						{
						_localctx = new UnitProductContext(new UnitFormulaContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, AntimonyParser.RULE_unitFormula);
						this.state = 512;
						if (!(this.precpred(this._ctx, 2))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 2)");
						}
						this.state = 513;
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
						this.state = 514;
						this.unitFormula(3);
						}
						break;

					case 3:
						{
						_localctx = new UnitSumContext(new UnitFormulaContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, AntimonyParser.RULE_unitFormula);
						this.state = 515;
						if (!(this.precpred(this._ctx, 1))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 1)");
						}
						this.state = 516;
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
						this.state = 517;
						this.unitFormula(2);
						}
						break;
					}
					}
				}
				this.state = 522;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 68, this._ctx);
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
		this.enterRule(_localctx, 86, AntimonyParser.RULE_inStatement);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 523;
			this.variable(0);
			this.state = 524;
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
		this.enterRule(_localctx, 88, AntimonyParser.RULE_modelImport);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 527;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 69, this._ctx) ) {
			case 1:
				{
				this.state = 526;
				this.nameLabel();
				}
				break;
			}
			this.state = 529;
			this.match(AntimonyParser.NAME);
			this.state = 530;
			this.exportList();
			this.state = 535;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === AntimonyParser.T__3) {
				{
				{
				this.state = 531;
				this.match(AntimonyParser.T__3);
				this.state = 532;
				this.modelImportOption();
				}
				}
				this.state = 537;
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
	public modelImportOption(): ModelImportOptionContext {
		let _localctx: ModelImportOptionContext = new ModelImportOptionContext(this._ctx, this.state);
		this.enterRule(_localctx, 90, AntimonyParser.RULE_modelImportOption);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 538;
			this.match(AntimonyParser.NAME);
			this.state = 539;
			this.match(AntimonyParser.T__15);
			this.state = 540;
			this.modelImportValue();
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
	public modelImportValue(): ModelImportValueContext {
		let _localctx: ModelImportValueContext = new ModelImportValueContext(this._ctx, this.state);
		this.enterRule(_localctx, 92, AntimonyParser.RULE_modelImportValue);
		try {
			this.state = 544;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case AntimonyParser.T__12:
			case AntimonyParser.NAME:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 542;
				this.variable(0);
				}
				break;
			case AntimonyParser.NUMBER:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 543;
				this.match(AntimonyParser.NUMBER);
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

	public sempred(_localctx: RuleContext, ruleIndex: number, predIndex: number): boolean {
		switch (ruleIndex) {
		case 9:
			return this.formula_sempred(_localctx as FormulaContext, predIndex);

		case 12:
			return this.variable_sempred(_localctx as VariableContext, predIndex);

		case 42:
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
		"\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x03,\u0225\x04\x02" +
		"\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06\x04\x07" +
		"\t\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04\v\t\v\x04\f\t\f\x04\r\t\r\x04" +
		"\x0E\t\x0E\x04\x0F\t\x0F\x04\x10\t\x10\x04\x11\t\x11\x04\x12\t\x12\x04" +
		"\x13\t\x13\x04\x14\t\x14\x04\x15\t\x15\x04\x16\t\x16\x04\x17\t\x17\x04" +
		"\x18\t\x18\x04\x19\t\x19\x04\x1A\t\x1A\x04\x1B\t\x1B\x04\x1C\t\x1C\x04" +
		"\x1D\t\x1D\x04\x1E\t\x1E\x04\x1F\t\x1F\x04 \t \x04!\t!\x04\"\t\"\x04#" +
		"\t#\x04$\t$\x04%\t%\x04&\t&\x04\'\t\'\x04(\t(\x04)\t)\x04*\t*\x04+\t+" +
		"\x04,\t,\x04-\t-\x04.\t.\x04/\t/\x040\t0\x03\x02\x05\x02b\n\x02\x03\x02" +
		"\x03\x02\x05\x02f\n\x02\x07\x02h\n\x02\f\x02\x0E\x02k\v\x02\x03\x02\x03" +
		"\x02\x03\x03\x03\x03\x03\x04\x03\x04\x03\x04\x05\x04t\n\x04\x03\x05\x05" +
		"\x05w\n\x05\x03\x05\x06\x05z\n\x05\r\x05\x0E\x05{\x03\x06\x03\x06\x03" +
		"\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x05" +
		"\x06\x89\n\x06\x03\x07\x03\x07\x05\x07\x8D\n\x07\x03\x07\x03\x07\x05\x07" +
		"\x91\n\x07\x03\x07\x03\x07\x03\x07\x03\b\x03\b\x03\b\x03\b\x07\b\x9A\n" +
		"\b\f\b\x0E\b\x9D\v\b\x05\b\x9F\n\b\x03\b\x03\b\x03\t\x03\t\x03\t\x03\t" +
		"\x07\t\xA7\n\t\f\t\x0E\t\xAA\v\t\x03\t\x03\t\x07\t\xAE\n\t\f\t\x0E\t\xB1" +
		"\v\t\x03\t\x03\t\x03\n\x03\n\x03\n\x03\n\x07\n\xB9\n\n\f\n\x0E\n\xBC\v" +
		"\n\x05\n\xBE\n\n\x03\n\x03\n\x03\v\x03\v\x03\v\x03\v\x03\v\x03\v\x03\v" +
		"\x03\v\x03\v\x03\v\x03\v\x03\v\x03\v\x03\v\x05\v\xD0\n\v\x03\v\x03\v\x03" +
		"\v\x03\v\x03\v\x03\v\x03\v\x03\v\x03\v\x03\v\x03\v\x03\v\x03\v\x03\v\x03" +
		"\v\x07\v\xE1\n\v\f\v\x0E\v\xE4\v\v\x03\f\x03\f\x03\f\x05\f\xE9\n\f\x03" +
		"\f\x03\f\x03\r\x03\r\x03\r\x07\r\xF0\n\r\f\r\x0E\r\xF3\v\r\x03\x0E\x03" +
		"\x0E\x03\x0E\x03\x0E\x05\x0E\xF9\n\x0E\x03\x0E\x03\x0E\x03\x0E\x07\x0E" +
		"\xFE\n\x0E\f\x0E\x0E\x0E\u0101\v\x0E\x03\x0F\x03\x0F\x03\x0F\x03\x10\x03" +
		"\x10\x03\x10\x07\x10\u0109\n\x10\f\x10\x0E\x10\u010C\v\x10\x03\x10\x05" +
		"\x10\u010F\n\x10\x03\x10\x03\x10\x03\x11\x05\x11\u0114\n\x11\x03\x11\x03" +
		"\x11\x03\x11\x05\x11\u0119\n\x11\x03\x11\x05\x11\u011C\n\x11\x03\x12\x05" +
		"\x12\u011F\n\x12\x03\x12\x03\x12\x05\x12\u0123\n\x12\x03\x13\x03\x13\x03" +
		"\x13\x07\x13\u0128\n\x13\f\x13\x0E\x13\u012B\v\x13\x03\x14\x05\x14\u012E" +
		"\n\x14\x03\x14\x03\x14\x03\x15\x05\x15\u0133\n\x15\x03\x15\x03\x15\x05" +
		"\x15\u0137\n\x15\x03\x16\x03\x16\x05\x16\u013B\n\x16\x03\x16\x05\x16\u013E" +
		"\n\x16\x03\x16\x03\x16\x05\x16\u0142\n\x16\x03\x17\x03\x17\x03\x17\x03" +
		"\x17\x07\x17\u0148\n\x17\f\x17\x0E\x17\u014B\v\x17\x03\x18\x03\x18\x05" +
		"\x18\u014F\n\x18\x03\x18\x03\x18\x03\x18\x05\x18\u0154\n\x18\x03\x18\x05" +
		"\x18\u0157\n\x18\x03\x18\x03\x18\x05\x18\u015B\n\x18\x03\x19\x03\x19\x03" +
		"\x19\x05\x19\u0160\n\x19\x05\x19\u0162\n\x19\x03\x1A\x05\x1A\u0165\n\x1A" +
		"\x03\x1A\x03\x1A\x03\x1A\x05\x1A\u016A\n\x1A\x03\x1A\x03\x1A\x05\x1A\u016E" +
		"\n\x1A\x03\x1A\x05\x1A\u0171\n\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03" +
		"\x1A\x05\x1A\u0178\n\x1A\x03\x1A\x03\x1A\x05\x1A\u017C\n\x1A\x05\x1A\u017E" +
		"\n\x1A\x03\x1B\x03\x1B\x06\x1B\u0182\n\x1B\r\x1B\x0E\x1B\u0183\x03\x1C" +
		"\x03\x1C\x03\x1C\x03\x1C\x03\x1D\x07\x1D\u018B\n\x1D\f\x1D\x0E\x1D\u018E" +
		"\v\x1D\x03\x1D\x03\x1D\x03\x1D\x07\x1D\u0193\n\x1D\f\x1D\x0E\x1D\u0196" +
		"\v\x1D\x03\x1D\x07\x1D\u0199\n\x1D\f\x1D\x0E\x1D\u019C\v\x1D\x03\x1E\x03" +
		"\x1E\x03\x1E\x05\x1E\u01A1\n\x1E\x03\x1F\x05\x1F\u01A4\n\x1F\x03\x1F\x03" +
		"\x1F\x03\x1F\x03\x1F\x03 \x03 \x05 \u01AC\n \x03 \x03 \x03 \x03 \x03 " +
		"\x03 \x03 \x05 \u01B5\n \x05 \u01B7\n \x03!\x03!\x03!\x03\"\x03\"\x03" +
		"\"\x03#\x03#\x03#\x03$\x03$\x03$\x05$\u01C5\n$\x03%\x03%\x03%\x03&\x03" +
		"&\x03&\x03&\x03\'\x03\'\x05\'\u01D0\n\'\x03\'\x03\'\x03(\x03(\x03(\x03" +
		"(\x05(\u01D8\n(\x03(\x07(\u01DB\n(\f(\x0E(\u01DE\v(\x03)\x03)\x03)\x03" +
		")\x03)\x05)\u01E5\n)\x03*\x03*\x03+\x03+\x03+\x03+\x05+\u01ED\n+\x03," +
		"\x03,\x03,\x03,\x03,\x03,\x03,\x05,\u01F6\n,\x03,\x03,\x03,\x03,\x03," +
		"\x03,\x05,\u01FE\n,\x03,\x03,\x03,\x03,\x03,\x03,\x03,\x03,\x03,\x07," +
		"\u0209\n,\f,\x0E,\u020C\v,\x03-\x03-\x03-\x03.\x05.\u0212\n.\x03.\x03" +
		".\x03.\x03.\x07.\u0218\n.\f.\x0E.\u021B\v.\x03/\x03/\x03/\x03/\x030\x03" +
		"0\x050\u0223\n0\x030\x02\x02\x05\x14\x1AV1\x02\x02\x04\x02\x06\x02\b\x02" +
		"\n\x02\f\x02\x0E\x02\x10\x02\x12\x02\x14\x02\x16\x02\x18\x02\x1A\x02\x1C" +
		"\x02\x1E\x02 \x02\"\x02$\x02&\x02(\x02*\x02,\x02.\x020\x022\x024\x026" +
		"\x028\x02:\x02<\x02>\x02@\x02B\x02D\x02F\x02H\x02J\x02L\x02N\x02P\x02" +
		"R\x02T\x02V\x02X\x02Z\x02\\\x02^\x02\x02\x07\x04\x02\x03\x03))\x04\x02" +
		"\x04\x04\f\r\x03\x02\t\n\x03\x02\x10\x11\x03\x02\'(\x02\u0258\x02a\x03" +
		"\x02\x02\x02\x04n\x03\x02\x02\x02\x06s\x03\x02\x02\x02\by\x03\x02\x02" +
		"\x02\n\x88\x03\x02\x02\x02\f\x8A\x03\x02\x02\x02\x0E\x95\x03\x02\x02\x02" +
		"\x10\xA2\x03\x02\x02\x02\x12\xB4\x03\x02\x02\x02\x14\xCF\x03\x02\x02\x02" +
		"\x16\xE5\x03\x02\x02\x02\x18\xEC\x03\x02\x02\x02\x1A\xF8\x03\x02\x02\x02" +
		"\x1C\u0102\x03\x02\x02\x02\x1E\u0105\x03\x02\x02\x02 \u0113\x03\x02\x02" +
		"\x02\"\u011E\x03\x02\x02\x02$\u0124\x03\x02\x02\x02&\u012D\x03\x02\x02" +
		"\x02(\u0136\x03\x02\x02\x02*\u0138\x03\x02\x02\x02,\u0143\x03\x02\x02" +
		"\x02.\u015A\x03\x02\x02\x020\u0161\x03\x02\x02\x022\u017D\x03\x02\x02" +
		"\x024\u0181\x03\x02\x02\x026\u0185\x03\x02\x02\x028\u018C\x03\x02\x02" +
		"\x02:\u019D\x03\x02\x02\x02<\u01A3\x03\x02\x02\x02>\u01B6\x03\x02\x02" +
		"\x02@\u01B8\x03\x02\x02\x02B\u01BB\x03\x02\x02\x02D\u01BE\x03\x02\x02" +
		"\x02F\u01C4\x03\x02\x02\x02H\u01C6\x03\x02\x02\x02J\u01C9\x03\x02\x02" +
		"\x02L\u01CD\x03\x02\x02\x02N\u01D3\x03\x02\x02\x02P\u01E4\x03\x02\x02" +
		"\x02R\u01E6\x03\x02\x02\x02T\u01E8\x03\x02\x02\x02V\u01FD\x03\x02\x02" +
		"\x02X\u020D\x03\x02\x02\x02Z\u0211\x03\x02\x02\x02\\\u021C\x03\x02\x02" +
		"\x02^\u0222\x03\x02\x02\x02`b\x05\x06\x04\x02a`\x03\x02\x02\x02ab\x03" +
		"\x02\x02\x02bi\x03\x02\x02\x02ce\x05\x04\x03\x02df\x05\x06\x04\x02ed\x03" +
		"\x02\x02\x02ef\x03\x02\x02\x02fh\x03\x02\x02\x02gc\x03\x02\x02\x02hk\x03" +
		"\x02\x02\x02ig\x03\x02\x02\x02ij\x03\x02\x02\x02jl\x03\x02\x02\x02ki\x03" +
		"\x02\x02\x02lm\x07\x02\x02\x03m\x03\x03\x02\x02\x02no\t\x02\x02\x02o\x05" +
		"\x03\x02\x02\x02pt\x05\f\x07\x02qt\x05\x10\t\x02rt\x05\n\x06\x02sp\x03" +
		"\x02\x02\x02sq\x03\x02\x02\x02sr\x03\x02\x02\x02t\x07\x03\x02\x02\x02" +
		"uw\x05\n\x06\x02vu\x03\x02\x02\x02vw\x03\x02\x02\x02wx\x03\x02\x02\x02" +
		"xz\x05\x04\x03\x02yv\x03\x02\x02\x02z{\x03\x02\x02\x02{y\x03\x02\x02\x02" +
		"{|\x03\x02\x02\x02|\t\x03\x02\x02\x02}\x89\x05 \x11\x02~\x89\x05*\x16" +
		"\x02\x7F\x89\x05,\x17\x02\x80\x89\x05Z.\x02\x81\x89\x052\x1A\x02\x82\x89" +
		"\x05<\x1F\x02\x83\x89\x05F$\x02\x84\x89\x05T+\x02\x85\x89\x05X-\x02\x86" +
		"\x89\x05> \x02\x87\x89\x05D#\x02\x88}\x03\x02\x02\x02\x88~\x03\x02\x02" +
		"\x02\x88\x7F\x03\x02\x02\x02\x88\x80\x03\x02\x02\x02\x88\x81\x03\x02\x02" +
		"\x02\x88\x82\x03\x02\x02\x02\x88\x83\x03\x02\x02\x02\x88\x84\x03\x02\x02" +
		"\x02\x88\x85\x03\x02\x02\x02\x88\x86\x03\x02\x02\x02\x88\x87\x03\x02\x02" +
		"\x02\x89\v\x03\x02\x02\x02\x8A\x8C\x07\x13\x02\x02\x8B\x8D\x07\x04\x02" +
		"\x02\x8C\x8B\x03\x02\x02\x02\x8C\x8D\x03\x02\x02\x02\x8D\x8E\x03\x02\x02" +
		"\x02\x8E\x90\x07 \x02\x02\x8F\x91\x05\x0E\b\x02\x90\x8F\x03\x02\x02\x02" +
		"\x90\x91\x03\x02\x02\x02\x91\x92\x03\x02\x02\x02\x92\x93\x05\b\x05\x02" +
		"\x93\x94\x07\x15\x02\x02\x94\r\x03\x02\x02\x02\x95\x9E\x07\x05\x02\x02" +
		"\x96\x9B\x05\x1A\x0E\x02\x97\x98\x07\x06\x02\x02\x98\x9A\x05\x1A\x0E\x02" +
		"\x99\x97\x03\x02\x02\x02\x9A\x9D\x03\x02\x02\x02\x9B\x99\x03\x02\x02\x02" +
		"\x9B\x9C\x03\x02\x02\x02\x9C\x9F\x03\x02\x02\x02\x9D\x9B\x03\x02\x02\x02" +
		"\x9E\x96\x03\x02\x02\x02\x9E\x9F\x03\x02\x02\x02\x9F\xA0\x03\x02\x02\x02" +
		"\xA0\xA1\x07\x07\x02\x02\xA1\x0F\x03\x02\x02\x02\xA2\xA3\x07\x14\x02\x02" +
		"\xA3\xA4\x07 \x02\x02\xA4\xA8\x05\x12\n\x02\xA5\xA7\x05\x04\x03\x02\xA6" +
		"\xA5\x03\x02\x02\x02\xA7\xAA\x03\x02\x02\x02\xA8\xA6\x03\x02\x02\x02\xA8" +
		"\xA9\x03\x02\x02\x02\xA9\xAB\x03\x02\x02\x02\xAA\xA8\x03\x02\x02\x02\xAB" +
		"\xAF\x05\x14\v\x02\xAC\xAE\x05\x04\x03\x02\xAD\xAC\x03\x02\x02\x02\xAE" +
		"\xB1\x03\x02\x02\x02\xAF\xAD\x03\x02\x02\x02\xAF\xB0\x03\x02\x02\x02\xB0" +
		"\xB2\x03\x02\x02\x02\xB1\xAF\x03\x02\x02\x02\xB2\xB3\x07\x15\x02\x02\xB3" +
		"\x11\x03\x02\x02\x02\xB4\xBD\x07\x05\x02\x02\xB5\xBA\x07 \x02\x02\xB6" +
		"\xB7\x07\x06\x02\x02\xB7\xB9\x07 \x02\x02\xB8\xB6\x03\x02\x02\x02\xB9" +
		"\xBC\x03\x02\x02\x02\xBA\xB8\x03\x02\x02\x02\xBA\xBB\x03\x02\x02\x02\xBB" +
		"\xBE\x03\x02\x02\x02\xBC\xBA\x03\x02\x02\x02\xBD\xB5\x03\x02\x02\x02\xBD" +
		"\xBE\x03\x02\x02\x02\xBE\xBF\x03\x02\x02\x02\xBF\xC0\x07\x07\x02\x02\xC0" +
		"\x13\x03\x02\x02\x02\xC1\xC2\b\v\x01\x02\xC2\xC3\x07\x05\x02\x02\xC3\xC4" +
		"\x05\x14\v\x02\xC4\xC5\x07\x07\x02\x02\xC5\xD0\x03\x02\x02\x02\xC6\xD0" +
		"\x07!\x02\x02\xC7\xD0\x05\x16\f\x02\xC8\xD0\x05\x1A\x0E\x02\xC9\xCA\x07" +
		"\t\x02\x02\xCA\xD0\x05\x14\v\t\xCB\xCC\x07\n\x02\x02\xCC\xD0\x05\x14\v" +
		"\b\xCD\xCE\x07\v\x02\x02\xCE\xD0\x05\x14\v\x07\xCF\xC1\x03\x02\x02\x02" +
		"\xCF\xC6\x03\x02\x02\x02\xCF\xC7\x03\x02\x02\x02\xCF\xC8\x03\x02\x02\x02" +
		"\xCF\xC9\x03\x02\x02\x02\xCF\xCB\x03\x02\x02\x02\xCF\xCD\x03\x02\x02\x02" +
		"\xD0\xE2\x03\x02\x02\x02\xD1\xD2\f\n\x02\x02\xD2\xD3\x07\b\x02\x02\xD3" +
		"\xE1\x05\x14\v\n\xD4\xD5\f\x06\x02\x02\xD5\xD6\t\x03\x02\x02\xD6\xE1\x05" +
		"\x14\v\x07\xD7\xD8\f\x05\x02\x02\xD8\xD9\t\x04\x02\x02\xD9\xE1\x05\x14" +
		"\v\x06\xDA\xDB\f\x04\x02\x02\xDB\xDC\x07%\x02\x02\xDC\xE1\x05\x14\v\x05" +
		"\xDD\xDE\f\x03\x02\x02\xDE\xDF\x07&\x02\x02\xDF\xE1\x05\x14\v\x04\xE0" +
		"\xD1\x03\x02\x02\x02\xE0\xD4\x03\x02\x02\x02\xE0\xD7\x03\x02\x02\x02\xE0" +
		"\xDA\x03\x02\x02\x02\xE0\xDD\x03\x02\x02\x02\xE1\xE4\x03\x02\x02\x02\xE2" +
		"\xE0\x03\x02\x02\x02\xE2\xE3\x03\x02\x02\x02\xE3\x15\x03\x02\x02\x02\xE4" +
		"\xE2\x03\x02\x02\x02\xE5\xE6\x07 \x02\x02\xE6\xE8\x07\x05\x02\x02\xE7" +
		"\xE9\x05\x18\r\x02\xE8\xE7\x03\x02\x02\x02\xE8\xE9\x03\x02\x02\x02\xE9" +
		"\xEA\x03\x02\x02\x02\xEA\xEB\x07\x07\x02\x02\xEB\x17\x03\x02\x02\x02\xEC" +
		"\xF1\x05\x14\v\x02\xED\xEE\x07\x06\x02\x02\xEE\xF0\x05\x14\v\x02\xEF\xED" +
		"\x03\x02\x02\x02\xF0\xF3\x03\x02\x02\x02\xF1\xEF\x03\x02\x02\x02\xF1\xF2" +
		"\x03\x02\x02\x02\xF2\x19\x03\x02\x02\x02\xF3\xF1\x03\x02\x02\x02\xF4\xF5" +
		"\b\x0E\x01\x02\xF5\xF9\x07 \x02\x02\xF6\xF7\x07\x0F\x02\x02\xF7\xF9\x05" +
		"\x1A\x0E\x03\xF8\xF4\x03\x02\x02\x02\xF8\xF6\x03\x02\x02\x02\xF9\xFF\x03" +
		"\x02\x02\x02\xFA\xFB\f\x04\x02\x02\xFB\xFC\x07\x0E\x02\x02\xFC\xFE\x07" +
		" \x02\x02\xFD\xFA\x03\x02\x02\x02\xFE\u0101\x03\x02\x02\x02\xFF\xFD\x03" +
		"\x02\x02\x02\xFF\u0100\x03\x02\x02\x02\u0100\x1B\x03\x02\x02\x02\u0101" +
		"\xFF\x03\x02\x02\x02\u0102\u0103\x07\x16\x02\x02\u0103\u0104\x05\x1A\x0E" +
		"\x02\u0104\x1D\x03\x02\x02\x02\u0105\u010A\x07 \x02\x02\u0106\u0107\x07" +
		"\x0E\x02\x02\u0107\u0109\x07 \x02\x02\u0108\u0106\x03\x02\x02\x02\u0109" +
		"\u010C\x03\x02\x02\x02\u010A\u0108\x03\x02\x02\x02\u010A\u010B\x03\x02" +
		"\x02\x02\u010B\u010E\x03\x02\x02\x02\u010C\u010A\x03\x02\x02\x02\u010D" +
		"\u010F\x05\x1C\x0F\x02\u010E\u010D\x03\x02\x02\x02\u010E\u010F\x03\x02" +
		"\x02\x02\u010F\u0110\x03\x02\x02\x02\u0110\u0111\x07\x10\x02\x02\u0111" +
		"\x1F\x03\x02\x02\x02\u0112\u0114\x05\x1E\x10\x02\u0113\u0112\x03\x02\x02" +
		"\x02\u0113\u0114\x03\x02\x02\x02\u0114\u0115\x03\x02\x02\x02\u0115\u0116" +
		"\x05\"\x12\x02\u0116\u0118\x07\x03\x02\x02\u0117\u0119\x05\x14\v\x02\u0118" +
		"\u0117\x03\x02\x02\x02\u0118\u0119\x03\x02\x02\x02\u0119\u011B\x03\x02" +
		"\x02\x02\u011A\u011C\x05\x1C\x0F\x02\u011B\u011A\x03\x02\x02\x02\u011B" +
		"\u011C\x03\x02\x02\x02\u011C!\x03\x02\x02\x02\u011D\u011F\x05$\x13\x02" +
		"\u011E\u011D\x03\x02\x02\x02\u011E\u011F\x03\x02\x02\x02\u011F\u0120\x03" +
		"\x02\x02\x02\u0120\u0122\x07\"\x02\x02\u0121\u0123\x05$\x13\x02\u0122" +
		"\u0121\x03\x02\x02\x02\u0122\u0123\x03\x02\x02\x02\u0123#\x03\x02\x02" +
		"\x02\u0124\u0129\x05&\x14\x02\u0125\u0126\x07\t\x02\x02\u0126\u0128\x05" +
		"&\x14\x02\u0127\u0125\x03\x02\x02\x02\u0128\u012B\x03\x02\x02\x02\u0129" +
		"\u0127\x03\x02\x02\x02\u0129\u012A\x03\x02\x02\x02\u012A%\x03\x02\x02" +
		"\x02\u012B\u0129\x03\x02\x02\x02\u012C\u012E\x05(\x15\x02\u012D\u012C" +
		"\x03\x02\x02\x02\u012D\u012E\x03\x02\x02\x02\u012E\u012F\x03\x02\x02\x02" +
		"\u012F\u0130\x05\x1A\x0E\x02\u0130\'\x03\x02\x02\x02\u0131\u0133\x07\n" +
		"\x02\x02\u0132\u0131\x03\x02\x02\x02\u0132\u0133\x03\x02\x02\x02\u0133" +
		"\u0134\x03\x02\x02\x02\u0134\u0137\x07!\x02\x02\u0135\u0137\x05\x1A\x0E" +
		"\x02\u0136\u0132\x03\x02\x02\x02\u0136\u0135\x03\x02\x02\x02\u0137)\x03" +
		"\x02\x02\x02\u0138\u013A\x05\x1A\x0E\x02\u0139\u013B\x05\x1C\x0F\x02\u013A" +
		"\u0139\x03\x02\x02\x02\u013A\u013B\x03\x02\x02\x02\u013B\u013D\x03\x02" +
		"\x02\x02\u013C\u013E\t\x05\x02\x02\u013D\u013C\x03\x02\x02\x02\u013D\u013E" +
		"\x03\x02\x02\x02\u013E\u013F\x03\x02\x02\x02\u013F\u0141\x07\x12\x02\x02" +
		"\u0140\u0142\x05\x14\v\x02\u0141\u0140\x03\x02\x02\x02\u0141\u0142\x03" +
		"\x02\x02\x02\u0142+\x03\x02\x02\x02\u0143\u0144\x05.\x18\x02\u0144\u0149" +
		"\x050\x19\x02\u0145\u0146\x07\x06\x02\x02\u0146\u0148\x050\x19\x02\u0147" +
		"\u0145\x03\x02\x02\x02\u0148\u014B\x03\x02\x02\x02\u0149\u0147\x03\x02" +
		"\x02\x02\u0149\u014A\x03\x02\x02\x02\u014A-\x03\x02\x02\x02\u014B\u0149" +
		"\x03\x02\x02\x02\u014C\u014E\x07\x1E\x02\x02\u014D\u014F\x07\x1C\x02\x02" +
		"\u014E\u014D\x03\x02\x02\x02\u014E\u014F\x03\x02\x02\x02\u014F\u0150\x03" +
		"\x02\x02\x02\u0150\u015B\x07\x1F\x02\x02\u0151\u0153\x07\x1E\x02\x02\u0152" +
		"\u0154\x07\x1C\x02\x02\u0153\u0152\x03\x02\x02\x02\u0153\u0154\x03\x02" +
		"\x02\x02\u0154\u015B\x03\x02\x02\x02\u0155\u0157\x07\x1C\x02\x02\u0156" +
		"\u0155\x03\x02\x02\x02\u0156\u0157\x03\x02\x02\x02\u0157\u0158\x03\x02" +
		"\x02\x02\u0158\u015B\x07\x1F\x02\x02\u0159\u015B\x07\x1C\x02\x02\u015A" +
		"\u014C\x03\x02\x02\x02\u015A\u0151\x03\x02\x02\x02\u015A\u0156\x03\x02" +
		"\x02\x02\u015A\u0159\x03\x02\x02\x02\u015B/\x03\x02\x02\x02\u015C\u0162" +
		"\x05*\x16\x02\u015D\u015F\x05\x1A\x0E\x02\u015E\u0160\x05\x1C\x0F\x02" +
		"\u015F\u015E\x03\x02\x02\x02\u015F\u0160\x03\x02\x02\x02\u0160\u0162\x03" +
		"\x02\x02\x02\u0161\u015C\x03\x02\x02\x02\u0161\u015D\x03\x02\x02\x02\u0162" +
		"1\x03\x02\x02\x02\u0163\u0165\x05\x1E\x10\x02\u0164\u0163\x03\x02\x02" +
		"\x02\u0164\u0165\x03\x02\x02\x02\u0165\u0166\x03\x02\x02\x02\u0166\u0167" +
		"\x07\x18\x02\x02\u0167\u0169\x05\x14\v\x02\u0168\u016A\x054\x1B\x02\u0169" +
		"\u0168\x03\x02\x02\x02\u0169\u016A\x03\x02\x02\x02\u016A\u016B\x03\x02" +
		"\x02\x02\u016B\u016D\x07\x10\x02\x02\u016C\u016E\x058\x1D\x02\u016D\u016C" +
		"\x03\x02\x02\x02\u016D\u016E\x03\x02\x02\x02\u016E\u017E\x03\x02\x02\x02" +
		"\u016F\u0171\x05\x1E\x10\x02\u0170\u016F\x03\x02\x02\x02\u0170\u0171\x03" +
		"\x02\x02\x02\u0171\u0172\x03\x02\x02\x02\u0172\u0173\x07\x18\x02\x02\u0173" +
		"\u0174\x05\x14\v\x02\u0174\u0175\x07\x19\x02\x02\u0175\u0177\x05\x14\v" +
		"\x02\u0176\u0178\x054\x1B\x02\u0177\u0176\x03\x02\x02\x02\u0177\u0178" +
		"\x03\x02\x02\x02\u0178\u0179\x03\x02\x02\x02\u0179\u017B\x07\x10\x02\x02" +
		"\u017A\u017C\x058\x1D\x02\u017B\u017A\x03\x02\x02\x02\u017B\u017C\x03" +
		"\x02\x02\x02\u017C\u017E\x03\x02\x02\x02\u017D\u0164\x03\x02\x02\x02\u017D" +
		"\u0170\x03\x02\x02\x02\u017E3\x03\x02\x02\x02\u017F\u0180\x07\x06\x02" +
		"\x02\u0180\u0182\x056\x1C\x02\u0181\u017F\x03\x02\x02\x02\u0182\u0183" +
		"\x03\x02\x02\x02\u0183\u0181\x03\x02\x02\x02\u0183\u0184\x03\x02\x02\x02" +
		"\u01845\x03\x02\x02\x02\u0185\u0186\x07 \x02\x02\u0186\u0187\x07\x12\x02" +
		"\x02\u0187\u0188\x05\x14\v\x02\u01887\x03\x02\x02\x02\u0189\u018B\x07" +
		")\x02\x02\u018A\u0189\x03\x02\x02\x02\u018B\u018E\x03\x02\x02\x02\u018C" +
		"\u018A\x03\x02\x02\x02\u018C\u018D\x03\x02\x02\x02\u018D\u018F\x03\x02" +
		"\x02\x02\u018E\u018C\x03\x02\x02\x02\u018F\u019A\x05:\x1E\x02\u0190\u0194" +
		"\x07\x06\x02\x02\u0191\u0193\x07)\x02\x02\u0192\u0191\x03\x02\x02\x02" +
		"\u0193\u0196\x03\x02\x02\x02\u0194\u0192\x03\x02\x02\x02\u0194\u0195\x03" +
		"\x02\x02\x02\u0195\u0197\x03\x02\x02\x02\u0196\u0194\x03\x02\x02\x02\u0197" +
		"\u0199\x05:\x1E\x02\u0198\u0190\x03\x02\x02\x02\u0199\u019C\x03\x02\x02" +
		"\x02\u019A\u0198\x03\x02\x02\x02\u019A\u019B\x03\x02\x02\x02\u019B9\x03" +
		"\x02\x02\x02\u019C\u019A\x03\x02\x02\x02\u019D\u019E\x05\x1A\x0E\x02\u019E" +
		"\u01A0\x07\x12\x02\x02\u019F\u01A1\x05\x14\v\x02\u01A0\u019F\x03\x02\x02" +
		"\x02\u01A0\u01A1\x03\x02\x02\x02\u01A1;\x03\x02\x02\x02\u01A2\u01A4\x05" +
		"\x1E\x10\x02\u01A3\u01A2\x03\x02\x02\x02\u01A3\u01A4\x03\x02\x02\x02\u01A4" +
		"\u01A5\x03\x02\x02\x02\u01A5\u01A6\x07!\x02\x02\u01A6\u01A7\x07\x12\x02" +
		"\x02\u01A7\u01A8\x05\x14\v\x02\u01A8=\x03\x02\x02\x02\u01A9\u01AB\x05" +
		"\x1A\x0E\x02\u01AA\u01AC\x05@!\x02\u01AB\u01AA\x03\x02\x02\x02\u01AB\u01AC" +
		"\x03\x02\x02\x02\u01AC\u01AD\x03\x02\x02\x02\u01AD\u01AE\x07\x17\x02\x02" +
		"\u01AE\u01AF\x05\x1A\x0E\x02\u01AF\u01B7\x03\x02\x02\x02\u01B0\u01B1\x05" +
		"\x1A\x0E\x02\u01B1\u01B2\x07\x17\x02\x02\u01B2\u01B4\x05\x1A\x0E\x02\u01B3" +
		"\u01B5\x05B\"\x02\u01B4\u01B3\x03\x02\x02\x02\u01B4\u01B5\x03\x02\x02" +
		"\x02\u01B5\u01B7\x03\x02\x02\x02\u01B6\u01A9\x03\x02\x02\x02\u01B6\u01B0" +
		"\x03\x02\x02\x02\u01B7?\x03\x02\x02\x02\u01B8\u01B9\x07\x04\x02\x02\u01B9" +
		"\u01BA\x05\x1A\x0E\x02\u01BAA\x03\x02\x02\x02\u01BB\u01BC\x07\f\x02\x02" +
		"\u01BC\u01BD\x05\x1A\x0E\x02\u01BDC\x03\x02\x02\x02\u01BE\u01BF\x07\x1D" +
		"\x02\x02\u01BF\u01C0\x05\x1A\x0E\x02\u01C0E\x03\x02\x02\x02\u01C1\u01C5" +
		"\x05H%\x02\u01C2\u01C5\x05J&\x02\u01C3\u01C5\x05L\'\x02\u01C4\u01C1\x03" +
		"\x02\x02\x02\u01C4\u01C2\x03\x02\x02\x02\u01C4\u01C3\x03\x02\x02\x02\u01C5" +
		"G\x03\x02\x02\x02\u01C6\u01C7\x05\x1A\x0E\x02\u01C7\u01C8\x05N(\x02\u01C8" +
		"I\x03\x02\x02\x02\u01C9\u01CA\x05\x1A\x0E\x02\u01CA\u01CB\x07\x1B\x02" +
		"\x02\u01CB\u01CC\x05V,\x02\u01CCK\x03\x02\x02\x02\u01CD\u01CF\x07\x13" +
		"\x02\x02\u01CE\u01D0\x07 \x02\x02\u01CF\u01CE\x03\x02\x02\x02\u01CF\u01D0" +
		"\x03\x02\x02\x02\u01D0\u01D1\x03\x02\x02\x02\u01D1\u01D2\x05N(\x02\u01D2" +
		"M\x03\x02\x02\x02\u01D3\u01D4\x05P)\x02\u01D4\u01DC\x05R*\x02\u01D5\u01D7" +
		"\x07\x06\x02\x02\u01D6\u01D8\x07)\x02\x02\u01D7\u01D6\x03\x02\x02\x02" +
		"\u01D7\u01D8\x03\x02\x02\x02\u01D8\u01D9\x03\x02\x02\x02\u01D9\u01DB\x05" +
		"R*\x02\u01DA\u01D5\x03\x02\x02\x02\u01DB\u01DE\x03\x02\x02\x02\u01DC\u01DA" +
		"\x03\x02\x02\x02\u01DC\u01DD\x03\x02\x02\x02\u01DDO\x03\x02\x02\x02\u01DE" +
		"\u01DC\x03\x02\x02\x02\u01DF\u01E5\x07\x17\x02\x02\u01E0\u01E5\x07 \x02" +
		"\x02\u01E1\u01E2\x07 \x02\x02\u01E2\u01E3\x07\x0E\x02\x02\u01E3\u01E5" +
		"\x05P)\x02\u01E4\u01DF\x03\x02\x02\x02\u01E4\u01E0\x03\x02\x02\x02\u01E4" +
		"\u01E1\x03\x02\x02\x02\u01E5Q\x03\x02\x02\x02\u01E6\u01E7\t\x06\x02\x02" +
		"\u01E7S\x03\x02\x02\x02\u01E8\u01E9\x07\x1A\x02\x02\u01E9\u01EC\x07 \x02" +
		"\x02\u01EA\u01EB\x07\x12\x02\x02\u01EB\u01ED\x05V,\x02\u01EC\u01EA\x03" +
		"\x02\x02\x02\u01EC\u01ED\x03\x02\x02\x02\u01EDU\x03\x02\x02\x02\u01EE" +
		"\u01EF\b,\x01\x02\u01EF\u01F0\x07\x05\x02\x02\u01F0\u01F1\x05V,\x02\u01F1" +
		"\u01F2\x07\x07\x02\x02\u01F2\u01FE\x03\x02\x02\x02\u01F3\u01F5\x07!\x02" +
		"\x02\u01F4\u01F6\x07 \x02\x02\u01F5\u01F4\x03\x02\x02\x02\u01F5\u01F6" +
		"\x03\x02\x02\x02\u01F6\u01FE\x03\x02\x02\x02\u01F7\u01FE\x07 \x02\x02" +
		"\u01F8\u01FE\x05R*\x02\u01F9\u01FA\x07\t\x02\x02\u01FA\u01FE\x05V,\x07" +
		"\u01FB\u01FC\x07\n\x02\x02\u01FC\u01FE\x05V,\x06\u01FD\u01EE\x03\x02\x02" +
		"\x02\u01FD\u01F3\x03\x02\x02\x02\u01FD\u01F7\x03\x02\x02\x02\u01FD\u01F8" +
		"\x03\x02\x02\x02\u01FD\u01F9\x03\x02\x02\x02\u01FD\u01FB\x03\x02\x02\x02" +
		"\u01FE\u020A\x03\x02\x02\x02\u01FF\u0200\f\x05\x02\x02\u0200\u0201\x07" +
		"\b\x02\x02\u0201\u0209\x05V,\x05\u0202\u0203\f\x04\x02\x02\u0203\u0204" +
		"\t\x03\x02\x02\u0204\u0209\x05V,\x05\u0205\u0206\f\x03\x02\x02\u0206\u0207" +
		"\t\x04\x02\x02\u0207\u0209\x05V,\x04\u0208\u01FF\x03\x02\x02\x02\u0208" +
		"\u0202\x03\x02\x02\x02\u0208\u0205\x03\x02\x02\x02\u0209\u020C\x03\x02" +
		"\x02\x02\u020A\u0208\x03\x02\x02\x02\u020A\u020B\x03\x02\x02\x02\u020B" +
		"W\x03\x02\x02\x02\u020C\u020A\x03\x02\x02\x02\u020D\u020E\x05\x1A\x0E" +
		"\x02\u020E\u020F\x05\x1C\x0F\x02\u020FY\x03\x02\x02\x02\u0210\u0212\x05" +
		"\x1E\x10\x02\u0211\u0210\x03\x02\x02\x02\u0211\u0212\x03\x02\x02\x02\u0212" +
		"\u0213\x03\x02\x02\x02\u0213\u0214\x07 \x02\x02\u0214\u0219\x05\x0E\b" +
		"\x02\u0215\u0216\x07\x06\x02\x02\u0216\u0218\x05\\/\x02\u0217\u0215\x03" +
		"\x02\x02\x02\u0218\u021B\x03\x02\x02\x02\u0219\u0217\x03\x02\x02\x02\u0219" +
		"\u021A\x03\x02\x02\x02\u021A[\x03\x02\x02\x02\u021B\u0219\x03\x02\x02" +
		"\x02\u021C\u021D\x07 \x02\x02\u021D\u021E\x07\x12\x02\x02\u021E\u021F" +
		"\x05^0\x02\u021F]\x03\x02\x02\x02\u0220\u0223\x05\x1A\x0E\x02\u0221\u0223" +
		"\x07!\x02\x02\u0222\u0220\x03\x02\x02\x02\u0222\u0221\x03\x02\x02\x02" +
		"\u0223_\x03\x02\x02\x02Jaeisv{\x88\x8C\x90\x9B\x9E\xA8\xAF\xBA\xBD\xCF" +
		"\xE0\xE2\xE8\xF1\xF8\xFF\u010A\u010E\u0113\u0118\u011B\u011E\u0122\u0129" +
		"\u012D\u0132\u0136\u013A\u013D\u0141\u0149\u014E\u0153\u0156\u015A\u015F" +
		"\u0161\u0164\u0169\u016D\u0170\u0177\u017B\u017D\u0183\u018C\u0194\u019A" +
		"\u01A0\u01A3\u01AB\u01B4\u01B6\u01C4\u01CF\u01D7\u01DC\u01E4\u01EC\u01F5" +
		"\u01FD\u0208\u020A\u0211\u0219\u0222";
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
	public algebraicRule(): AlgebraicRuleContext | undefined {
		return this.tryGetRuleContext(0, AlgebraicRuleContext);
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
	public formula(): FormulaContext | undefined {
		return this.tryGetRuleContext(0, FormulaContext);
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


export class AlgebraicRuleContext extends ParserRuleContext {
	public NUMBER(): TerminalNode { return this.getToken(AntimonyParser.NUMBER, 0); }
	public formula(): FormulaContext {
		return this.getRuleContext(0, FormulaContext);
	}
	public nameLabel(): NameLabelContext | undefined {
		return this.tryGetRuleContext(0, NameLabelContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return AntimonyParser.RULE_algebraicRule; }
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterAlgebraicRule) {
			listener.enterAlgebraicRule(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitAlgebraicRule) {
			listener.exitAlgebraicRule(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitAlgebraicRule) {
			return visitor.visitAlgebraicRule(this);
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
	public conversionFactorLeft(): ConversionFactorLeftContext | undefined {
		return this.tryGetRuleContext(0, ConversionFactorLeftContext);
	}
	public conversionFactorRight(): ConversionFactorRightContext | undefined {
		return this.tryGetRuleContext(0, ConversionFactorRightContext);
	}
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


export class ConversionFactorLeftContext extends ParserRuleContext {
	public variable(): VariableContext {
		return this.getRuleContext(0, VariableContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return AntimonyParser.RULE_conversionFactorLeft; }
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterConversionFactorLeft) {
			listener.enterConversionFactorLeft(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitConversionFactorLeft) {
			listener.exitConversionFactorLeft(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitConversionFactorLeft) {
			return visitor.visitConversionFactorLeft(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ConversionFactorRightContext extends ParserRuleContext {
	public variable(): VariableContext {
		return this.getRuleContext(0, VariableContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return AntimonyParser.RULE_conversionFactorRight; }
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterConversionFactorRight) {
			listener.enterConversionFactorRight(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitConversionFactorRight) {
			listener.exitConversionFactorRight(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitConversionFactorRight) {
			return visitor.visitConversionFactorRight(this);
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
	public modelImportOption(): ModelImportOptionContext[];
	public modelImportOption(i: number): ModelImportOptionContext;
	public modelImportOption(i?: number): ModelImportOptionContext | ModelImportOptionContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ModelImportOptionContext);
		} else {
			return this.getRuleContext(i, ModelImportOptionContext);
		}
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


export class ModelImportOptionContext extends ParserRuleContext {
	public NAME(): TerminalNode { return this.getToken(AntimonyParser.NAME, 0); }
	public modelImportValue(): ModelImportValueContext {
		return this.getRuleContext(0, ModelImportValueContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return AntimonyParser.RULE_modelImportOption; }
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterModelImportOption) {
			listener.enterModelImportOption(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitModelImportOption) {
			listener.exitModelImportOption(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitModelImportOption) {
			return visitor.visitModelImportOption(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ModelImportValueContext extends ParserRuleContext {
	public variable(): VariableContext | undefined {
		return this.tryGetRuleContext(0, VariableContext);
	}
	public NUMBER(): TerminalNode | undefined { return this.tryGetToken(AntimonyParser.NUMBER, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return AntimonyParser.RULE_modelImportValue; }
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterModelImportValue) {
			listener.enterModelImportValue(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitModelImportValue) {
			listener.exitModelImportValue(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitModelImportValue) {
			return visitor.visitModelImportValue(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


