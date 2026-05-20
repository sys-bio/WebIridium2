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
	public static readonly MODEL = 15;
	public static readonly END = 16;
	public static readonly IN = 17;
	public static readonly AT = 18;
	public static readonly NAME = 19;
	public static readonly NUMBER = 20;
	public static readonly ARROW = 21;
	public static readonly ASSIGNMENT = 22;
	public static readonly INTERACTION = 23;
	public static readonly DASHES = 24;
	public static readonly COMPARE = 25;
	public static readonly LOGICAL = 26;
	public static readonly NEWLINE = 27;
	public static readonly WHITESPACE = 28;
	public static readonly COMMENT = 29;
	public static readonly LINE_COMMENT = 30;
	public static readonly RULE_root = 0;
	public static readonly RULE_statementSeparator = 1;
	public static readonly RULE_topLevelStatement = 2;
	public static readonly RULE_statementList = 3;
	public static readonly RULE_statement = 4;
	public static readonly RULE_model = 5;
	public static readonly RULE_exportList = 6;
	public static readonly RULE_reaction = 7;
	public static readonly RULE_reactionName = 8;
	public static readonly RULE_reactionFormula = 9;
	public static readonly RULE_reactantList = 10;
	public static readonly RULE_reactant = 11;
	public static readonly RULE_inCompartment = 12;
	public static readonly RULE_assignment = 13;
	public static readonly RULE_formula = 14;
	public static readonly RULE_functionCall = 15;
	public static readonly RULE_parameterList = 16;
	public static readonly RULE_variable = 17;
	public static readonly RULE_event = 18;
	public static readonly RULE_eventAssignment = 19;
	public static readonly RULE_modelCall = 20;
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"root", "statementSeparator", "topLevelStatement", "statementList", "statement", 
		"model", "exportList", "reaction", "reactionName", "reactionFormula", 
		"reactantList", "reactant", "inCompartment", "assignment", "formula", 
		"functionCall", "parameterList", "variable", "event", "eventAssignment", 
		"modelCall",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
		undefined, "';'", "'*'", "'('", "','", "')'", "':'", "'+'", "'''", "'-'", 
		"'^'", "'/'", "'%'", "'.'", "'$'", undefined, "'end'", "'in'", "'at'", 
		undefined, undefined, undefined, undefined, undefined, "'--'",
	];
	private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, "MODEL", "END", "IN", "AT", "NAME", "NUMBER", "ARROW", "ASSIGNMENT", 
		"INTERACTION", "DASHES", "COMPARE", "LOGICAL", "NEWLINE", "WHITESPACE", 
		"COMMENT", "LINE_COMMENT",
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
			this.state = 43;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << AntimonyParser.T__13) | (1 << AntimonyParser.MODEL) | (1 << AntimonyParser.AT) | (1 << AntimonyParser.NAME) | (1 << AntimonyParser.NUMBER) | (1 << AntimonyParser.ARROW))) !== 0)) {
				{
				this.state = 42;
				this.topLevelStatement();
				}
			}

			this.state = 51;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === AntimonyParser.T__0 || _la === AntimonyParser.NEWLINE) {
				{
				{
				this.state = 45;
				this.statementSeparator();
				this.state = 47;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << AntimonyParser.T__13) | (1 << AntimonyParser.MODEL) | (1 << AntimonyParser.AT) | (1 << AntimonyParser.NAME) | (1 << AntimonyParser.NUMBER) | (1 << AntimonyParser.ARROW))) !== 0)) {
					{
					this.state = 46;
					this.topLevelStatement();
					}
				}

				}
				}
				this.state = 53;
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
	public statementSeparator(): StatementSeparatorContext {
		let _localctx: StatementSeparatorContext = new StatementSeparatorContext(this._ctx, this.state);
		this.enterRule(_localctx, 2, AntimonyParser.RULE_statementSeparator);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 54;
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
			this.state = 58;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case AntimonyParser.MODEL:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 56;
				this.model();
				}
				break;
			case AntimonyParser.T__13:
			case AntimonyParser.AT:
			case AntimonyParser.NAME:
			case AntimonyParser.NUMBER:
			case AntimonyParser.ARROW:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 57;
				this.statement();
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
	public statementList(): StatementListContext {
		let _localctx: StatementListContext = new StatementListContext(this._ctx, this.state);
		this.enterRule(_localctx, 6, AntimonyParser.RULE_statementList);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 64;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			do {
				{
				{
				this.state = 61;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << AntimonyParser.T__13) | (1 << AntimonyParser.AT) | (1 << AntimonyParser.NAME) | (1 << AntimonyParser.NUMBER) | (1 << AntimonyParser.ARROW))) !== 0)) {
					{
					this.state = 60;
					this.statement();
					}
				}

				this.state = 63;
				this.statementSeparator();
				}
				}
				this.state = 66;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			} while ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << AntimonyParser.T__0) | (1 << AntimonyParser.T__13) | (1 << AntimonyParser.AT) | (1 << AntimonyParser.NAME) | (1 << AntimonyParser.NUMBER) | (1 << AntimonyParser.ARROW) | (1 << AntimonyParser.NEWLINE))) !== 0));
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
			this.state = 72;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 6, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 68;
				this.reaction();
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 69;
				this.assignment();
				}
				break;

			case 3:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 70;
				this.modelCall();
				}
				break;

			case 4:
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 71;
				this.event();
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
			this.state = 74;
			this.match(AntimonyParser.MODEL);
			this.state = 76;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === AntimonyParser.T__1) {
				{
				this.state = 75;
				this.match(AntimonyParser.T__1);
				}
			}

			this.state = 78;
			this.match(AntimonyParser.NAME);
			this.state = 80;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === AntimonyParser.T__2) {
				{
				this.state = 79;
				this.exportList();
				}
			}

			this.state = 82;
			this.statementList();
			this.state = 83;
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
			this.state = 85;
			this.match(AntimonyParser.T__2);
			this.state = 94;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === AntimonyParser.T__13 || _la === AntimonyParser.NAME) {
				{
				this.state = 86;
				this.variable(0);
				this.state = 91;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === AntimonyParser.T__3) {
					{
					{
					this.state = 87;
					this.match(AntimonyParser.T__3);
					this.state = 88;
					this.variable(0);
					}
					}
					this.state = 93;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				}
			}

			this.state = 96;
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
	public reaction(): ReactionContext {
		let _localctx: ReactionContext = new ReactionContext(this._ctx, this.state);
		this.enterRule(_localctx, 14, AntimonyParser.RULE_reaction);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 99;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 11, this._ctx) ) {
			case 1:
				{
				this.state = 98;
				this.reactionName();
				}
				break;
			}
			this.state = 101;
			this.reactionFormula();
			this.state = 102;
			this.match(AntimonyParser.T__0);
			this.state = 104;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << AntimonyParser.T__2) | (1 << AntimonyParser.T__6) | (1 << AntimonyParser.T__8) | (1 << AntimonyParser.T__13) | (1 << AntimonyParser.NAME) | (1 << AntimonyParser.NUMBER))) !== 0)) {
				{
				this.state = 103;
				this.formula(0);
				}
			}

			this.state = 107;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === AntimonyParser.IN) {
				{
				this.state = 106;
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
	public reactionName(): ReactionNameContext {
		let _localctx: ReactionNameContext = new ReactionNameContext(this._ctx, this.state);
		this.enterRule(_localctx, 16, AntimonyParser.RULE_reactionName);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 109;
			this.match(AntimonyParser.NAME);
			this.state = 111;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === AntimonyParser.IN) {
				{
				this.state = 110;
				this.inCompartment();
				}
			}

			this.state = 113;
			this.match(AntimonyParser.T__5);
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
		this.enterRule(_localctx, 18, AntimonyParser.RULE_reactionFormula);
		let _la: number;
		try {
			this.state = 125;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 17, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 116;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << AntimonyParser.T__13) | (1 << AntimonyParser.NAME) | (1 << AntimonyParser.NUMBER))) !== 0)) {
					{
					this.state = 115;
					_localctx._left = this.reactantList();
					}
				}

				this.state = 118;
				this.match(AntimonyParser.ARROW);
				this.state = 119;
				_localctx._right = this.reactantList();
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 120;
				_localctx._left = this.reactantList();
				this.state = 121;
				this.match(AntimonyParser.ARROW);
				this.state = 123;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << AntimonyParser.T__13) | (1 << AntimonyParser.NAME) | (1 << AntimonyParser.NUMBER))) !== 0)) {
					{
					this.state = 122;
					_localctx._right = this.reactantList();
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
	public reactantList(): ReactantListContext {
		let _localctx: ReactantListContext = new ReactantListContext(this._ctx, this.state);
		this.enterRule(_localctx, 20, AntimonyParser.RULE_reactantList);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 127;
			this.reactant();
			this.state = 132;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === AntimonyParser.T__6) {
				{
				{
				this.state = 128;
				this.match(AntimonyParser.T__6);
				this.state = 129;
				this.reactant();
				}
				}
				this.state = 134;
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
		this.enterRule(_localctx, 22, AntimonyParser.RULE_reactant);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 136;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === AntimonyParser.NUMBER) {
				{
				this.state = 135;
				this.match(AntimonyParser.NUMBER);
				}
			}

			this.state = 138;
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
	public inCompartment(): InCompartmentContext {
		let _localctx: InCompartmentContext = new InCompartmentContext(this._ctx, this.state);
		this.enterRule(_localctx, 24, AntimonyParser.RULE_inCompartment);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 140;
			this.match(AntimonyParser.IN);
			this.state = 141;
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
	public assignment(): AssignmentContext {
		let _localctx: AssignmentContext = new AssignmentContext(this._ctx, this.state);
		this.enterRule(_localctx, 26, AntimonyParser.RULE_assignment);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 143;
			this.variable(0);
			this.state = 145;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === AntimonyParser.IN) {
				{
				this.state = 144;
				this.inCompartment();
				}
			}

			this.state = 148;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === AntimonyParser.T__7) {
				{
				this.state = 147;
				_localctx._apostrophe = this.match(AntimonyParser.T__7);
				}
			}

			this.state = 150;
			_localctx._op = this.match(AntimonyParser.ASSIGNMENT);
			this.state = 151;
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
		let _startState: number = 28;
		this.enterRecursionRule(_localctx, 28, AntimonyParser.RULE_formula, _p);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 165;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 22, this._ctx) ) {
			case 1:
				{
				_localctx = new GroupContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;

				this.state = 154;
				this.match(AntimonyParser.T__2);
				this.state = 155;
				this.formula(0);
				this.state = 156;
				this.match(AntimonyParser.T__4);
				}
				break;

			case 2:
				{
				_localctx = new NumberContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 158;
				this.match(AntimonyParser.NUMBER);
				}
				break;

			case 3:
				{
				_localctx = new CallContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 159;
				this.functionCall();
				}
				break;

			case 4:
				{
				_localctx = new VarContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 160;
				this.variable(0);
				}
				break;

			case 5:
				{
				_localctx = new PositiveContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 161;
				this.match(AntimonyParser.T__6);
				this.state = 162;
				this.formula(7);
				}
				break;

			case 6:
				{
				_localctx = new NegativeContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 163;
				this.match(AntimonyParser.T__8);
				this.state = 164;
				this.formula(6);
				}
				break;
			}
			this._ctx._stop = this._input.tryLT(-1);
			this.state = 184;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 24, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = _localctx;
					{
					this.state = 182;
					this._errHandler.sync(this);
					switch ( this.interpreter.adaptivePredict(this._input, 23, this._ctx) ) {
					case 1:
						{
						_localctx = new PowerContext(new FormulaContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, AntimonyParser.RULE_formula);
						this.state = 167;
						if (!(this.precpred(this._ctx, 5))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 5)");
						}
						this.state = 168;
						this.match(AntimonyParser.T__9);
						this.state = 169;
						this.formula(5);
						}
						break;

					case 2:
						{
						_localctx = new ProductContext(new FormulaContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, AntimonyParser.RULE_formula);
						this.state = 170;
						if (!(this.precpred(this._ctx, 4))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 4)");
						}
						this.state = 171;
						(_localctx as ProductContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if (!((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << AntimonyParser.T__1) | (1 << AntimonyParser.T__10) | (1 << AntimonyParser.T__11))) !== 0))) {
							(_localctx as ProductContext)._op = this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						this.state = 172;
						this.formula(5);
						}
						break;

					case 3:
						{
						_localctx = new SumContext(new FormulaContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, AntimonyParser.RULE_formula);
						this.state = 173;
						if (!(this.precpred(this._ctx, 3))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 3)");
						}
						this.state = 174;
						(_localctx as SumContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if (!(_la === AntimonyParser.T__6 || _la === AntimonyParser.T__8)) {
							(_localctx as SumContext)._op = this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						this.state = 175;
						this.formula(4);
						}
						break;

					case 4:
						{
						_localctx = new CompareContext(new FormulaContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, AntimonyParser.RULE_formula);
						this.state = 176;
						if (!(this.precpred(this._ctx, 2))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 2)");
						}
						this.state = 177;
						(_localctx as CompareContext)._op = this.match(AntimonyParser.COMPARE);
						this.state = 178;
						this.formula(3);
						}
						break;

					case 5:
						{
						_localctx = new LogicalContext(new FormulaContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, AntimonyParser.RULE_formula);
						this.state = 179;
						if (!(this.precpred(this._ctx, 1))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 1)");
						}
						this.state = 180;
						(_localctx as LogicalContext)._op = this.match(AntimonyParser.LOGICAL);
						this.state = 181;
						this.formula(2);
						}
						break;
					}
					}
				}
				this.state = 186;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 24, this._ctx);
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
		this.enterRule(_localctx, 30, AntimonyParser.RULE_functionCall);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 187;
			this.match(AntimonyParser.NAME);
			this.state = 188;
			this.match(AntimonyParser.T__2);
			this.state = 190;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << AntimonyParser.T__2) | (1 << AntimonyParser.T__6) | (1 << AntimonyParser.T__8) | (1 << AntimonyParser.T__13) | (1 << AntimonyParser.NAME) | (1 << AntimonyParser.NUMBER))) !== 0)) {
				{
				this.state = 189;
				this.parameterList();
				}
			}

			this.state = 192;
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
	public parameterList(): ParameterListContext {
		let _localctx: ParameterListContext = new ParameterListContext(this._ctx, this.state);
		this.enterRule(_localctx, 32, AntimonyParser.RULE_parameterList);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 194;
			this.formula(0);
			this.state = 199;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === AntimonyParser.T__3) {
				{
				{
				this.state = 195;
				this.match(AntimonyParser.T__3);
				this.state = 196;
				this.formula(0);
				}
				}
				this.state = 201;
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
		let _startState: number = 34;
		this.enterRecursionRule(_localctx, 34, AntimonyParser.RULE_variable, _p);
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 206;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case AntimonyParser.NAME:
				{
				_localctx = new NameContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;

				this.state = 203;
				this.match(AntimonyParser.NAME);
				}
				break;
			case AntimonyParser.T__13:
				{
				_localctx = new ConstantContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 204;
				this.match(AntimonyParser.T__13);
				this.state = 205;
				this.variable(1);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			this._ctx._stop = this._input.tryLT(-1);
			this.state = 213;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 28, this._ctx);
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
					this.state = 208;
					if (!(this.precpred(this._ctx, 2))) {
						throw this.createFailedPredicateException("this.precpred(this._ctx, 2)");
					}
					this.state = 209;
					this.match(AntimonyParser.T__12);
					this.state = 210;
					this.match(AntimonyParser.NAME);
					}
					}
				}
				this.state = 215;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 28, this._ctx);
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
	public event(): EventContext {
		let _localctx: EventContext = new EventContext(this._ctx, this.state);
		this.enterRule(_localctx, 36, AntimonyParser.RULE_event);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 216;
			this.match(AntimonyParser.AT);
			this.state = 217;
			this.formula(0);
			this.state = 218;
			this.match(AntimonyParser.T__5);
			this.state = 222;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === AntimonyParser.NEWLINE) {
				{
				{
				this.state = 219;
				this.match(AntimonyParser.NEWLINE);
				}
				}
				this.state = 224;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 225;
			this.eventAssignment();
			this.state = 230;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === AntimonyParser.T__3) {
				{
				{
				this.state = 226;
				this.match(AntimonyParser.T__3);
				this.state = 227;
				this.eventAssignment();
				}
				}
				this.state = 232;
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
		this.enterRule(_localctx, 38, AntimonyParser.RULE_eventAssignment);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 233;
			this.variable(0);
			this.state = 234;
			this.match(AntimonyParser.ASSIGNMENT);
			this.state = 235;
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
	public modelCall(): ModelCallContext {
		let _localctx: ModelCallContext = new ModelCallContext(this._ctx, this.state);
		this.enterRule(_localctx, 40, AntimonyParser.RULE_modelCall);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 237;
			this.reactionName();
			this.state = 238;
			this.match(AntimonyParser.NAME);
			this.state = 239;
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
		case 14:
			return this.formula_sempred(_localctx as FormulaContext, predIndex);

		case 17:
			return this.variable_sempred(_localctx as VariableContext, predIndex);
		}
		return true;
	}
	private formula_sempred(_localctx: FormulaContext, predIndex: number): boolean {
		switch (predIndex) {
		case 0:
			return this.precpred(this._ctx, 5);

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

	public static readonly _serializedATN: string =
		"\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x03 \xF4\x04\x02" +
		"\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06\x04\x07" +
		"\t\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04\v\t\v\x04\f\t\f\x04\r\t\r\x04" +
		"\x0E\t\x0E\x04\x0F\t\x0F\x04\x10\t\x10\x04\x11\t\x11\x04\x12\t\x12\x04" +
		"\x13\t\x13\x04\x14\t\x14\x04\x15\t\x15\x04\x16\t\x16\x03\x02\x05\x02." +
		"\n\x02\x03\x02\x03\x02\x05\x022\n\x02\x07\x024\n\x02\f\x02\x0E\x027\v" +
		"\x02\x03\x03\x03\x03\x03\x04\x03\x04\x05\x04=\n\x04\x03\x05\x05\x05@\n" +
		"\x05\x03\x05\x06\x05C\n\x05\r\x05\x0E\x05D\x03\x06\x03\x06\x03\x06\x03" +
		"\x06\x05\x06K\n\x06\x03\x07\x03\x07\x05\x07O\n\x07\x03\x07\x03\x07\x05" +
		"\x07S\n\x07\x03\x07\x03\x07\x03\x07\x03\b\x03\b\x03\b\x03\b\x07\b\\\n" +
		"\b\f\b\x0E\b_\v\b\x05\ba\n\b\x03\b\x03\b\x03\t\x05\tf\n\t\x03\t\x03\t" +
		"\x03\t\x05\tk\n\t\x03\t\x05\tn\n\t\x03\n\x03\n\x05\nr\n\n\x03\n\x03\n" +
		"\x03\v\x05\vw\n\v\x03\v\x03\v\x03\v\x03\v\x03\v\x05\v~\n\v\x05\v\x80\n" +
		"\v\x03\f\x03\f\x03\f\x07\f\x85\n\f\f\f\x0E\f\x88\v\f\x03\r\x05\r\x8B\n" +
		"\r\x03\r\x03\r\x03\x0E\x03\x0E\x03\x0E\x03\x0F\x03\x0F\x05\x0F\x94\n\x0F" +
		"\x03\x0F\x05\x0F\x97\n\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x10\x03\x10\x03" +
		"\x10\x03\x10\x03\x10\x03\x10\x03\x10\x03\x10\x03\x10\x03\x10\x03\x10\x03" +
		"\x10\x05\x10\xA8\n\x10\x03\x10\x03\x10\x03\x10\x03\x10\x03\x10\x03\x10" +
		"\x03\x10\x03\x10\x03\x10\x03\x10\x03\x10\x03\x10\x03\x10\x03\x10\x03\x10" +
		"\x07\x10\xB9\n\x10\f\x10\x0E\x10\xBC\v\x10\x03\x11\x03\x11\x03\x11\x05" +
		"\x11\xC1\n\x11\x03\x11\x03\x11\x03\x12\x03\x12\x03\x12\x07\x12\xC8\n\x12" +
		"\f\x12\x0E\x12\xCB\v\x12\x03\x13\x03\x13\x03\x13\x03\x13\x05\x13\xD1\n" +
		"\x13\x03\x13\x03\x13\x03\x13\x07\x13\xD6\n\x13\f\x13\x0E\x13\xD9\v\x13" +
		"\x03\x14\x03\x14\x03\x14\x03\x14\x07\x14\xDF\n\x14\f\x14\x0E\x14\xE2\v" +
		"\x14\x03\x14\x03\x14\x03\x14\x07\x14\xE7\n\x14\f\x14\x0E\x14\xEA\v\x14" +
		"\x03\x15\x03\x15\x03\x15\x03\x15\x03\x16\x03\x16\x03\x16\x03\x16\x03\x16" +
		"\x02\x02\x04\x1E$\x17\x02\x02\x04\x02\x06\x02\b\x02\n\x02\f\x02\x0E\x02" +
		"\x10\x02\x12\x02\x14\x02\x16\x02\x18\x02\x1A\x02\x1C\x02\x1E\x02 \x02" +
		"\"\x02$\x02&\x02(\x02*\x02\x02\x05\x04\x02\x03\x03\x1D\x1D\x04\x02\x04" +
		"\x04\r\x0E\x04\x02\t\t\v\v\x02\u0106\x02-\x03\x02\x02\x02\x048\x03\x02" +
		"\x02\x02\x06<\x03\x02\x02\x02\bB\x03\x02\x02\x02\nJ\x03\x02\x02\x02\f" +
		"L\x03\x02\x02\x02\x0EW\x03\x02\x02\x02\x10e\x03\x02\x02\x02\x12o\x03\x02" +
		"\x02\x02\x14\x7F\x03\x02\x02\x02\x16\x81\x03\x02\x02\x02\x18\x8A\x03\x02" +
		"\x02\x02\x1A\x8E\x03\x02\x02\x02\x1C\x91\x03\x02\x02\x02\x1E\xA7\x03\x02" +
		"\x02\x02 \xBD\x03\x02\x02\x02\"\xC4\x03\x02\x02\x02$\xD0\x03\x02\x02\x02" +
		"&\xDA\x03\x02\x02\x02(\xEB\x03\x02\x02\x02*\xEF\x03\x02\x02\x02,.\x05" +
		"\x06\x04\x02-,\x03\x02\x02\x02-.\x03\x02\x02\x02.5\x03\x02\x02\x02/1\x05" +
		"\x04\x03\x0202\x05\x06\x04\x0210\x03\x02\x02\x0212\x03\x02\x02\x0224\x03" +
		"\x02\x02\x023/\x03\x02\x02\x0247\x03\x02\x02\x0253\x03\x02\x02\x0256\x03" +
		"\x02\x02\x026\x03\x03\x02\x02\x0275\x03\x02\x02\x0289\t\x02\x02\x029\x05" +
		"\x03\x02\x02\x02:=\x05\f\x07\x02;=\x05\n\x06\x02<:\x03\x02\x02\x02<;\x03" +
		"\x02\x02\x02=\x07\x03\x02\x02\x02>@\x05\n\x06\x02?>\x03\x02\x02\x02?@" +
		"\x03\x02\x02\x02@A\x03\x02\x02\x02AC\x05\x04\x03\x02B?\x03\x02\x02\x02" +
		"CD\x03\x02\x02\x02DB\x03\x02\x02\x02DE\x03\x02\x02\x02E\t\x03\x02\x02" +
		"\x02FK\x05\x10\t\x02GK\x05\x1C\x0F\x02HK\x05*\x16\x02IK\x05&\x14\x02J" +
		"F\x03\x02\x02\x02JG\x03\x02\x02\x02JH\x03\x02\x02\x02JI\x03\x02\x02\x02" +
		"K\v\x03\x02\x02\x02LN\x07\x11\x02\x02MO\x07\x04\x02\x02NM\x03\x02\x02" +
		"\x02NO\x03\x02\x02\x02OP\x03\x02\x02\x02PR\x07\x15\x02\x02QS\x05\x0E\b" +
		"\x02RQ\x03\x02\x02\x02RS\x03\x02\x02\x02ST\x03\x02\x02\x02TU\x05\b\x05" +
		"\x02UV\x07\x12\x02\x02V\r\x03\x02\x02\x02W`\x07\x05\x02\x02X]\x05$\x13" +
		"\x02YZ\x07\x06\x02\x02Z\\\x05$\x13\x02[Y\x03\x02\x02\x02\\_\x03\x02\x02" +
		"\x02][\x03\x02\x02\x02]^\x03\x02\x02\x02^a\x03\x02\x02\x02_]\x03\x02\x02" +
		"\x02`X\x03\x02\x02\x02`a\x03\x02\x02\x02ab\x03\x02\x02\x02bc\x07\x07\x02" +
		"\x02c\x0F\x03\x02\x02\x02df\x05\x12\n\x02ed\x03\x02\x02\x02ef\x03\x02" +
		"\x02\x02fg\x03\x02\x02\x02gh\x05\x14\v\x02hj\x07\x03\x02\x02ik\x05\x1E" +
		"\x10\x02ji\x03\x02\x02\x02jk\x03\x02\x02\x02km\x03\x02\x02\x02ln\x05\x1A" +
		"\x0E\x02ml\x03\x02\x02\x02mn\x03\x02\x02\x02n\x11\x03\x02\x02\x02oq\x07" +
		"\x15\x02\x02pr\x05\x1A\x0E\x02qp\x03\x02\x02\x02qr\x03\x02\x02\x02rs\x03" +
		"\x02\x02\x02st\x07\b\x02\x02t\x13\x03\x02\x02\x02uw\x05\x16\f\x02vu\x03" +
		"\x02\x02\x02vw\x03\x02\x02\x02wx\x03\x02\x02\x02xy\x07\x17\x02\x02y\x80" +
		"\x05\x16\f\x02z{\x05\x16\f\x02{}\x07\x17\x02\x02|~\x05\x16\f\x02}|\x03" +
		"\x02\x02\x02}~\x03\x02\x02\x02~\x80\x03\x02\x02\x02\x7Fv\x03\x02\x02\x02" +
		"\x7Fz\x03\x02\x02\x02\x80\x15\x03\x02\x02\x02\x81\x86\x05\x18\r\x02\x82" +
		"\x83\x07\t\x02\x02\x83\x85\x05\x18\r\x02\x84\x82\x03\x02\x02\x02\x85\x88" +
		"\x03\x02\x02\x02\x86\x84\x03\x02\x02\x02\x86\x87\x03\x02\x02\x02\x87\x17" +
		"\x03\x02\x02\x02\x88\x86\x03\x02\x02\x02\x89\x8B\x07\x16\x02\x02\x8A\x89" +
		"\x03\x02\x02\x02\x8A\x8B\x03\x02\x02\x02\x8B\x8C\x03\x02\x02\x02\x8C\x8D" +
		"\x05$\x13\x02\x8D\x19\x03\x02\x02\x02\x8E\x8F\x07\x13\x02\x02\x8F\x90" +
		"\x05$\x13\x02\x90\x1B\x03\x02\x02\x02\x91\x93\x05$\x13\x02\x92\x94\x05" +
		"\x1A\x0E\x02\x93\x92\x03\x02\x02\x02\x93\x94\x03\x02\x02\x02\x94\x96\x03" +
		"\x02\x02\x02\x95\x97\x07\n\x02\x02\x96\x95\x03\x02\x02\x02\x96\x97\x03" +
		"\x02\x02\x02\x97\x98\x03\x02\x02\x02\x98\x99\x07\x18\x02\x02\x99\x9A\x05" +
		"\x1E\x10\x02\x9A\x1D\x03\x02\x02\x02\x9B\x9C\b\x10\x01\x02\x9C\x9D\x07" +
		"\x05\x02\x02\x9D\x9E\x05\x1E\x10\x02\x9E\x9F\x07\x07\x02\x02\x9F\xA8\x03" +
		"\x02\x02\x02\xA0\xA8\x07\x16\x02\x02\xA1\xA8\x05 \x11\x02\xA2\xA8\x05" +
		"$\x13\x02\xA3\xA4\x07\t\x02\x02\xA4\xA8\x05\x1E\x10\t\xA5\xA6\x07\v\x02" +
		"\x02\xA6\xA8\x05\x1E\x10\b\xA7\x9B\x03\x02\x02\x02\xA7\xA0\x03\x02\x02" +
		"\x02\xA7\xA1\x03\x02\x02\x02\xA7\xA2\x03\x02\x02\x02\xA7\xA3\x03\x02\x02" +
		"\x02\xA7\xA5\x03\x02\x02\x02\xA8\xBA\x03\x02\x02\x02\xA9\xAA\f\x07\x02" +
		"\x02\xAA\xAB\x07\f\x02\x02\xAB\xB9\x05\x1E\x10\x07\xAC\xAD\f\x06\x02\x02" +
		"\xAD\xAE\t\x03\x02\x02\xAE\xB9\x05\x1E\x10\x07\xAF\xB0\f\x05\x02\x02\xB0" +
		"\xB1\t\x04\x02\x02\xB1\xB9\x05\x1E\x10\x06\xB2\xB3\f\x04\x02\x02\xB3\xB4" +
		"\x07\x1B\x02\x02\xB4\xB9\x05\x1E\x10\x05\xB5\xB6\f\x03\x02\x02\xB6\xB7" +
		"\x07\x1C\x02\x02\xB7\xB9\x05\x1E\x10\x04\xB8\xA9\x03\x02\x02\x02\xB8\xAC" +
		"\x03\x02\x02\x02\xB8\xAF\x03\x02\x02\x02\xB8\xB2\x03\x02\x02\x02\xB8\xB5" +
		"\x03\x02\x02\x02\xB9\xBC\x03\x02\x02\x02\xBA\xB8\x03\x02\x02\x02\xBA\xBB" +
		"\x03\x02\x02\x02\xBB\x1F\x03\x02\x02\x02\xBC\xBA\x03\x02\x02\x02\xBD\xBE" +
		"\x07\x15\x02\x02\xBE\xC0\x07\x05\x02\x02\xBF\xC1\x05\"\x12\x02\xC0\xBF" +
		"\x03\x02\x02\x02\xC0\xC1\x03\x02\x02\x02\xC1\xC2\x03\x02\x02\x02\xC2\xC3" +
		"\x07\x07\x02\x02\xC3!\x03\x02\x02\x02\xC4\xC9\x05\x1E\x10\x02\xC5\xC6" +
		"\x07\x06\x02\x02\xC6\xC8\x05\x1E\x10\x02\xC7\xC5\x03\x02\x02\x02\xC8\xCB" +
		"\x03\x02\x02\x02\xC9\xC7\x03\x02\x02\x02\xC9\xCA\x03\x02\x02\x02\xCA#" +
		"\x03\x02\x02\x02\xCB\xC9\x03\x02\x02\x02\xCC\xCD\b\x13\x01\x02\xCD\xD1" +
		"\x07\x15\x02\x02\xCE\xCF\x07\x10\x02\x02\xCF\xD1\x05$\x13\x03\xD0\xCC" +
		"\x03\x02\x02\x02\xD0\xCE\x03\x02\x02\x02\xD1\xD7\x03\x02\x02\x02\xD2\xD3" +
		"\f\x04\x02\x02\xD3\xD4\x07\x0F\x02\x02\xD4\xD6\x07\x15\x02\x02\xD5\xD2" +
		"\x03\x02\x02\x02\xD6\xD9\x03\x02\x02\x02\xD7\xD5\x03\x02\x02\x02\xD7\xD8" +
		"\x03\x02\x02\x02\xD8%\x03\x02\x02\x02\xD9\xD7\x03\x02\x02\x02\xDA\xDB" +
		"\x07\x14\x02\x02\xDB\xDC\x05\x1E\x10\x02\xDC\xE0\x07\b\x02\x02\xDD\xDF" +
		"\x07\x1D\x02\x02\xDE\xDD\x03\x02\x02\x02\xDF\xE2\x03\x02\x02\x02\xE0\xDE" +
		"\x03\x02\x02\x02\xE0\xE1\x03\x02\x02\x02\xE1\xE3\x03\x02\x02\x02\xE2\xE0" +
		"\x03\x02\x02\x02\xE3\xE8\x05(\x15\x02\xE4\xE5\x07\x06\x02\x02\xE5\xE7" +
		"\x05(\x15\x02\xE6\xE4\x03\x02\x02\x02\xE7\xEA\x03\x02\x02\x02\xE8\xE6" +
		"\x03\x02\x02\x02\xE8\xE9\x03\x02\x02\x02\xE9\'\x03\x02\x02\x02\xEA\xE8" +
		"\x03\x02\x02\x02\xEB\xEC\x05$\x13\x02\xEC\xED\x07\x18\x02\x02\xED\xEE" +
		"\x05\x1E\x10\x02\xEE)\x03\x02\x02\x02\xEF\xF0\x05\x12\n\x02\xF0\xF1\x07" +
		"\x15\x02\x02\xF1\xF2\x05\x0E\b\x02\xF2+\x03\x02\x02\x02!-15<?DJNR]`ej" +
		"mqv}\x7F\x86\x8A\x93\x96\xA7\xB8\xBA\xC0\xC9\xD0\xD7\xE0\xE8";
	public static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!AntimonyParser.__ATN) {
			AntimonyParser.__ATN = new ATNDeserializer().deserialize(Utils.toCharArray(AntimonyParser._serializedATN));
		}

		return AntimonyParser.__ATN;
	}

}

export class RootContext extends ParserRuleContext {
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
	public modelCall(): ModelCallContext | undefined {
		return this.tryGetRuleContext(0, ModelCallContext);
	}
	public event(): EventContext | undefined {
		return this.tryGetRuleContext(0, EventContext);
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


export class ReactionContext extends ParserRuleContext {
	public reactionFormula(): ReactionFormulaContext {
		return this.getRuleContext(0, ReactionFormulaContext);
	}
	public reactionName(): ReactionNameContext | undefined {
		return this.tryGetRuleContext(0, ReactionNameContext);
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


export class ReactionNameContext extends ParserRuleContext {
	public NAME(): TerminalNode { return this.getToken(AntimonyParser.NAME, 0); }
	public inCompartment(): InCompartmentContext | undefined {
		return this.tryGetRuleContext(0, InCompartmentContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return AntimonyParser.RULE_reactionName; }
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterReactionName) {
			listener.enterReactionName(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitReactionName) {
			listener.exitReactionName(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitReactionName) {
			return visitor.visitReactionName(this);
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
	public NUMBER(): TerminalNode | undefined { return this.tryGetToken(AntimonyParser.NUMBER, 0); }
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


export class AssignmentContext extends ParserRuleContext {
	public _apostrophe!: Token;
	public _op!: Token;
	public variable(): VariableContext {
		return this.getRuleContext(0, VariableContext);
	}
	public formula(): FormulaContext {
		return this.getRuleContext(0, FormulaContext);
	}
	public ASSIGNMENT(): TerminalNode { return this.getToken(AntimonyParser.ASSIGNMENT, 0); }
	public inCompartment(): InCompartmentContext | undefined {
		return this.tryGetRuleContext(0, InCompartmentContext);
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
	public parameterList(): ParameterListContext | undefined {
		return this.tryGetRuleContext(0, ParameterListContext);
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


export class ParameterListContext extends ParserRuleContext {
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


export class EventContext extends ParserRuleContext {
	public AT(): TerminalNode { return this.getToken(AntimonyParser.AT, 0); }
	public formula(): FormulaContext {
		return this.getRuleContext(0, FormulaContext);
	}
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


export class EventAssignmentContext extends ParserRuleContext {
	public variable(): VariableContext {
		return this.getRuleContext(0, VariableContext);
	}
	public ASSIGNMENT(): TerminalNode { return this.getToken(AntimonyParser.ASSIGNMENT, 0); }
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


export class ModelCallContext extends ParserRuleContext {
	public reactionName(): ReactionNameContext {
		return this.getRuleContext(0, ReactionNameContext);
	}
	public NAME(): TerminalNode { return this.getToken(AntimonyParser.NAME, 0); }
	public exportList(): ExportListContext {
		return this.getRuleContext(0, ExportListContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return AntimonyParser.RULE_modelCall; }
	// @Override
	public enterRule(listener: AntimonyListener): void {
		if (listener.enterModelCall) {
			listener.enterModelCall(this);
		}
	}
	// @Override
	public exitRule(listener: AntimonyListener): void {
		if (listener.exitModelCall) {
			listener.exitModelCall(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AntimonyVisitor<Result>): Result {
		if (visitor.visitModelCall) {
			return visitor.visitModelCall(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


