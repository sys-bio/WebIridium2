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
	public static readonly MODEL = 16;
	public static readonly END = 17;
	public static readonly IN = 18;
	public static readonly AT = 19;
	public static readonly AFTER = 20;
	public static readonly UNIT = 21;
	public static readonly HAS = 22;
	public static readonly CONST_MODIFIER = 23;
	public static readonly DECL_WORD = 24;
	public static readonly NAME = 25;
	public static readonly NUMBER = 26;
	public static readonly ARROW = 27;
	public static readonly INTERACTION = 28;
	public static readonly DASHES = 29;
	public static readonly COMPARE = 30;
	public static readonly LOGICAL = 31;
	public static readonly STRING = 32;
	public static readonly LONG_STRING = 33;
	public static readonly NEWLINE = 34;
	public static readonly WHITESPACE = 35;
	public static readonly COMMENT = 36;
	public static readonly LINE_COMMENT = 37;
	public static readonly RULE_root = 0;
	public static readonly RULE_statementSeparator = 1;
	public static readonly RULE_topLevelStatement = 2;
	public static readonly RULE_statementList = 3;
	public static readonly RULE_statement = 4;
	public static readonly RULE_model = 5;
	public static readonly RULE_exportList = 6;
	public static readonly RULE_formula = 7;
	public static readonly RULE_functionCall = 8;
	public static readonly RULE_parameterList = 9;
	public static readonly RULE_variable = 10;
	public static readonly RULE_inCompartment = 11;
	public static readonly RULE_reaction = 12;
	public static readonly RULE_reactionName = 13;
	public static readonly RULE_reactionFormula = 14;
	public static readonly RULE_reactantList = 15;
	public static readonly RULE_reactant = 16;
	public static readonly RULE_assignment = 17;
	public static readonly RULE_declaration = 18;
	public static readonly RULE_declarationTerm = 19;
	public static readonly RULE_event = 20;
	public static readonly RULE_eventOptions = 21;
	public static readonly RULE_eventOption = 22;
	public static readonly RULE_eventAssignments = 23;
	public static readonly RULE_eventAssignment = 24;
	public static readonly RULE_annotation = 25;
	public static readonly RULE_variableAnnotation = 26;
	public static readonly RULE_hasAnnotation = 27;
	public static readonly RULE_modelAnnotation = 28;
	public static readonly RULE_annotationBody = 29;
	public static readonly RULE_annotationItem = 30;
	public static readonly RULE_string = 31;
	public static readonly RULE_unitDeclaration = 32;
	public static readonly RULE_unitFormula = 33;
	public static readonly RULE_modelCall = 34;
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"root", "statementSeparator", "topLevelStatement", "statementList", "statement", 
		"model", "exportList", "formula", "functionCall", "parameterList", "variable", 
		"inCompartment", "reaction", "reactionName", "reactionFormula", "reactantList", 
		"reactant", "assignment", "declaration", "declarationTerm", "event", "eventOptions", 
		"eventOption", "eventAssignments", "eventAssignment", "annotation", "variableAnnotation", 
		"hasAnnotation", "modelAnnotation", "annotationBody", "annotationItem", 
		"string", "unitDeclaration", "unitFormula", "modelCall",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
		undefined, "';'", "'*'", "'('", "','", "')'", "'+'", "'-'", "'^'", "'/'", 
		"'%'", "'.'", "'$'", "':'", "'''", "'='", undefined, "'end'", "'in'", 
		"'at'", "'after'", "'unit'", "'has'", undefined, undefined, undefined, 
		undefined, undefined, undefined, "'--'",
	];
	private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, "MODEL", "END", "IN", "AT", "AFTER", "UNIT", "HAS", 
		"CONST_MODIFIER", "DECL_WORD", "NAME", "NUMBER", "ARROW", "INTERACTION", 
		"DASHES", "COMPARE", "LOGICAL", "STRING", "LONG_STRING", "NEWLINE", "WHITESPACE", 
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
			this.state = 71;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << AntimonyParser.T__11) | (1 << AntimonyParser.MODEL) | (1 << AntimonyParser.AT) | (1 << AntimonyParser.UNIT) | (1 << AntimonyParser.CONST_MODIFIER) | (1 << AntimonyParser.DECL_WORD) | (1 << AntimonyParser.NAME) | (1 << AntimonyParser.NUMBER) | (1 << AntimonyParser.ARROW))) !== 0)) {
				{
				this.state = 70;
				this.topLevelStatement();
				}
			}

			this.state = 79;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === AntimonyParser.T__0 || _la === AntimonyParser.NEWLINE) {
				{
				{
				this.state = 73;
				this.statementSeparator();
				this.state = 75;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << AntimonyParser.T__11) | (1 << AntimonyParser.MODEL) | (1 << AntimonyParser.AT) | (1 << AntimonyParser.UNIT) | (1 << AntimonyParser.CONST_MODIFIER) | (1 << AntimonyParser.DECL_WORD) | (1 << AntimonyParser.NAME) | (1 << AntimonyParser.NUMBER) | (1 << AntimonyParser.ARROW))) !== 0)) {
					{
					this.state = 74;
					this.topLevelStatement();
					}
				}

				}
				}
				this.state = 81;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 82;
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
			this.state = 84;
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
			this.state = 88;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 3, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 86;
				this.model();
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 87;
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
			this.state = 94;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			do {
				{
				{
				this.state = 91;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << AntimonyParser.T__11) | (1 << AntimonyParser.MODEL) | (1 << AntimonyParser.AT) | (1 << AntimonyParser.UNIT) | (1 << AntimonyParser.CONST_MODIFIER) | (1 << AntimonyParser.DECL_WORD) | (1 << AntimonyParser.NAME) | (1 << AntimonyParser.NUMBER) | (1 << AntimonyParser.ARROW))) !== 0)) {
					{
					this.state = 90;
					this.statement();
					}
				}

				this.state = 93;
				this.statementSeparator();
				}
				}
				this.state = 96;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			} while ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << AntimonyParser.T__0) | (1 << AntimonyParser.T__11) | (1 << AntimonyParser.MODEL) | (1 << AntimonyParser.AT) | (1 << AntimonyParser.UNIT) | (1 << AntimonyParser.CONST_MODIFIER) | (1 << AntimonyParser.DECL_WORD) | (1 << AntimonyParser.NAME) | (1 << AntimonyParser.NUMBER) | (1 << AntimonyParser.ARROW))) !== 0) || _la === AntimonyParser.NEWLINE);
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
			this.state = 105;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 6, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 98;
				this.reaction();
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 99;
				this.assignment();
				}
				break;

			case 3:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 100;
				this.declaration();
				}
				break;

			case 4:
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 101;
				this.modelCall();
				}
				break;

			case 5:
				this.enterOuterAlt(_localctx, 5);
				{
				this.state = 102;
				this.event();
				}
				break;

			case 6:
				this.enterOuterAlt(_localctx, 6);
				{
				this.state = 103;
				this.annotation();
				}
				break;

			case 7:
				this.enterOuterAlt(_localctx, 7);
				{
				this.state = 104;
				this.unitDeclaration();
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
			this.state = 107;
			this.match(AntimonyParser.MODEL);
			this.state = 109;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === AntimonyParser.T__1) {
				{
				this.state = 108;
				this.match(AntimonyParser.T__1);
				}
			}

			this.state = 111;
			this.match(AntimonyParser.NAME);
			this.state = 113;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === AntimonyParser.T__2) {
				{
				this.state = 112;
				this.exportList();
				}
			}

			this.state = 115;
			this.statementList();
			this.state = 116;
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
			this.state = 118;
			this.match(AntimonyParser.T__2);
			this.state = 127;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === AntimonyParser.T__11 || _la === AntimonyParser.NAME) {
				{
				this.state = 119;
				this.variable(0);
				this.state = 124;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === AntimonyParser.T__3) {
					{
					{
					this.state = 120;
					this.match(AntimonyParser.T__3);
					this.state = 121;
					this.variable(0);
					}
					}
					this.state = 126;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				}
			}

			this.state = 129;
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
		let _startState: number = 14;
		this.enterRecursionRule(_localctx, 14, AntimonyParser.RULE_formula, _p);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 143;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 11, this._ctx) ) {
			case 1:
				{
				_localctx = new GroupContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;

				this.state = 132;
				this.match(AntimonyParser.T__2);
				this.state = 133;
				this.formula(0);
				this.state = 134;
				this.match(AntimonyParser.T__4);
				}
				break;

			case 2:
				{
				_localctx = new NumberContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 136;
				this.match(AntimonyParser.NUMBER);
				}
				break;

			case 3:
				{
				_localctx = new CallContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 137;
				this.functionCall();
				}
				break;

			case 4:
				{
				_localctx = new VarContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 138;
				this.variable(0);
				}
				break;

			case 5:
				{
				_localctx = new PositiveContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 139;
				this.match(AntimonyParser.T__5);
				this.state = 140;
				this.formula(7);
				}
				break;

			case 6:
				{
				_localctx = new NegativeContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 141;
				this.match(AntimonyParser.T__6);
				this.state = 142;
				this.formula(6);
				}
				break;
			}
			this._ctx._stop = this._input.tryLT(-1);
			this.state = 162;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 13, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = _localctx;
					{
					this.state = 160;
					this._errHandler.sync(this);
					switch ( this.interpreter.adaptivePredict(this._input, 12, this._ctx) ) {
					case 1:
						{
						_localctx = new PowerContext(new FormulaContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, AntimonyParser.RULE_formula);
						this.state = 145;
						if (!(this.precpred(this._ctx, 5))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 5)");
						}
						this.state = 146;
						this.match(AntimonyParser.T__7);
						this.state = 147;
						this.formula(5);
						}
						break;

					case 2:
						{
						_localctx = new ProductContext(new FormulaContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, AntimonyParser.RULE_formula);
						this.state = 148;
						if (!(this.precpred(this._ctx, 4))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 4)");
						}
						this.state = 149;
						(_localctx as ProductContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if (!((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << AntimonyParser.T__1) | (1 << AntimonyParser.T__8) | (1 << AntimonyParser.T__9))) !== 0))) {
							(_localctx as ProductContext)._op = this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						this.state = 150;
						this.formula(5);
						}
						break;

					case 3:
						{
						_localctx = new SumContext(new FormulaContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, AntimonyParser.RULE_formula);
						this.state = 151;
						if (!(this.precpred(this._ctx, 3))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 3)");
						}
						this.state = 152;
						(_localctx as SumContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if (!(_la === AntimonyParser.T__5 || _la === AntimonyParser.T__6)) {
							(_localctx as SumContext)._op = this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						this.state = 153;
						this.formula(4);
						}
						break;

					case 4:
						{
						_localctx = new CompareContext(new FormulaContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, AntimonyParser.RULE_formula);
						this.state = 154;
						if (!(this.precpred(this._ctx, 2))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 2)");
						}
						this.state = 155;
						(_localctx as CompareContext)._op = this.match(AntimonyParser.COMPARE);
						this.state = 156;
						this.formula(3);
						}
						break;

					case 5:
						{
						_localctx = new LogicalContext(new FormulaContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, AntimonyParser.RULE_formula);
						this.state = 157;
						if (!(this.precpred(this._ctx, 1))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 1)");
						}
						this.state = 158;
						(_localctx as LogicalContext)._op = this.match(AntimonyParser.LOGICAL);
						this.state = 159;
						this.formula(2);
						}
						break;
					}
					}
				}
				this.state = 164;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 13, this._ctx);
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
		this.enterRule(_localctx, 16, AntimonyParser.RULE_functionCall);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 165;
			this.match(AntimonyParser.NAME);
			this.state = 166;
			this.match(AntimonyParser.T__2);
			this.state = 168;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << AntimonyParser.T__2) | (1 << AntimonyParser.T__5) | (1 << AntimonyParser.T__6) | (1 << AntimonyParser.T__11) | (1 << AntimonyParser.NAME) | (1 << AntimonyParser.NUMBER))) !== 0)) {
				{
				this.state = 167;
				this.parameterList();
				}
			}

			this.state = 170;
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
		this.enterRule(_localctx, 18, AntimonyParser.RULE_parameterList);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 172;
			this.formula(0);
			this.state = 177;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === AntimonyParser.T__3) {
				{
				{
				this.state = 173;
				this.match(AntimonyParser.T__3);
				this.state = 174;
				this.formula(0);
				}
				}
				this.state = 179;
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
		let _startState: number = 20;
		this.enterRecursionRule(_localctx, 20, AntimonyParser.RULE_variable, _p);
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 184;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case AntimonyParser.NAME:
				{
				_localctx = new NameContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;

				this.state = 181;
				this.match(AntimonyParser.NAME);
				}
				break;
			case AntimonyParser.T__11:
				{
				_localctx = new ConstantContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 182;
				this.match(AntimonyParser.T__11);
				this.state = 183;
				this.variable(1);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			this._ctx._stop = this._input.tryLT(-1);
			this.state = 191;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 17, this._ctx);
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
					this.state = 186;
					if (!(this.precpred(this._ctx, 2))) {
						throw this.createFailedPredicateException("this.precpred(this._ctx, 2)");
					}
					this.state = 187;
					this.match(AntimonyParser.T__10);
					this.state = 188;
					this.match(AntimonyParser.NAME);
					}
					}
				}
				this.state = 193;
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
	public inCompartment(): InCompartmentContext {
		let _localctx: InCompartmentContext = new InCompartmentContext(this._ctx, this.state);
		this.enterRule(_localctx, 22, AntimonyParser.RULE_inCompartment);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 194;
			this.match(AntimonyParser.IN);
			this.state = 195;
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
	public reaction(): ReactionContext {
		let _localctx: ReactionContext = new ReactionContext(this._ctx, this.state);
		this.enterRule(_localctx, 24, AntimonyParser.RULE_reaction);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 198;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 18, this._ctx) ) {
			case 1:
				{
				this.state = 197;
				this.reactionName();
				}
				break;
			}
			this.state = 200;
			this.reactionFormula();
			this.state = 201;
			this.match(AntimonyParser.T__0);
			this.state = 203;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << AntimonyParser.T__2) | (1 << AntimonyParser.T__5) | (1 << AntimonyParser.T__6) | (1 << AntimonyParser.T__11) | (1 << AntimonyParser.NAME) | (1 << AntimonyParser.NUMBER))) !== 0)) {
				{
				this.state = 202;
				this.formula(0);
				}
			}

			this.state = 206;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === AntimonyParser.IN) {
				{
				this.state = 205;
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
		this.enterRule(_localctx, 26, AntimonyParser.RULE_reactionName);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 208;
			this.match(AntimonyParser.NAME);
			this.state = 210;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === AntimonyParser.IN) {
				{
				this.state = 209;
				this.inCompartment();
				}
			}

			this.state = 212;
			this.match(AntimonyParser.T__12);
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
		this.enterRule(_localctx, 28, AntimonyParser.RULE_reactionFormula);
		let _la: number;
		try {
			this.state = 224;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 24, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 215;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << AntimonyParser.T__11) | (1 << AntimonyParser.NAME) | (1 << AntimonyParser.NUMBER))) !== 0)) {
					{
					this.state = 214;
					_localctx._left = this.reactantList();
					}
				}

				this.state = 217;
				this.match(AntimonyParser.ARROW);
				this.state = 218;
				_localctx._right = this.reactantList();
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 219;
				_localctx._left = this.reactantList();
				this.state = 220;
				this.match(AntimonyParser.ARROW);
				this.state = 222;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << AntimonyParser.T__11) | (1 << AntimonyParser.NAME) | (1 << AntimonyParser.NUMBER))) !== 0)) {
					{
					this.state = 221;
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
		this.enterRule(_localctx, 30, AntimonyParser.RULE_reactantList);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 226;
			this.reactant();
			this.state = 231;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === AntimonyParser.T__5) {
				{
				{
				this.state = 227;
				this.match(AntimonyParser.T__5);
				this.state = 228;
				this.reactant();
				}
				}
				this.state = 233;
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
		this.enterRule(_localctx, 32, AntimonyParser.RULE_reactant);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 235;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === AntimonyParser.NUMBER) {
				{
				this.state = 234;
				this.match(AntimonyParser.NUMBER);
				}
			}

			this.state = 237;
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
		this.enterRule(_localctx, 34, AntimonyParser.RULE_assignment);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 239;
			this.variable(0);
			this.state = 241;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === AntimonyParser.IN) {
				{
				this.state = 240;
				this.inCompartment();
				}
			}

			this.state = 244;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === AntimonyParser.T__12 || _la === AntimonyParser.T__13) {
				{
				this.state = 243;
				_localctx._mod = this._input.LT(1);
				_la = this._input.LA(1);
				if (!(_la === AntimonyParser.T__12 || _la === AntimonyParser.T__13)) {
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

			this.state = 246;
			this.match(AntimonyParser.T__14);
			this.state = 247;
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
	public declaration(): DeclarationContext {
		let _localctx: DeclarationContext = new DeclarationContext(this._ctx, this.state);
		this.enterRule(_localctx, 36, AntimonyParser.RULE_declaration);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 253;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 29, this._ctx) ) {
			case 1:
				{
				{
				this.state = 249;
				this.match(AntimonyParser.CONST_MODIFIER);
				this.state = 250;
				this.match(AntimonyParser.DECL_WORD);
				}
				}
				break;

			case 2:
				{
				this.state = 251;
				this.match(AntimonyParser.DECL_WORD);
				}
				break;

			case 3:
				{
				this.state = 252;
				this.match(AntimonyParser.CONST_MODIFIER);
				}
				break;
			}
			this.state = 255;
			this.declarationTerm();
			this.state = 260;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === AntimonyParser.T__3) {
				{
				{
				this.state = 256;
				this.match(AntimonyParser.T__3);
				this.state = 257;
				this.declarationTerm();
				}
				}
				this.state = 262;
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
	public declarationTerm(): DeclarationTermContext {
		let _localctx: DeclarationTermContext = new DeclarationTermContext(this._ctx, this.state);
		this.enterRule(_localctx, 38, AntimonyParser.RULE_declarationTerm);
		let _la: number;
		try {
			this.state = 268;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 32, this._ctx) ) {
			case 1:
				_localctx = new DeclarationAssignmentContext(_localctx);
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 263;
				this.assignment();
				}
				break;

			case 2:
				_localctx = new DeclarationNameContext(_localctx);
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 264;
				this.variable(0);
				this.state = 266;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === AntimonyParser.IN) {
					{
					this.state = 265;
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
		this.enterRule(_localctx, 40, AntimonyParser.RULE_event);
		let _la: number;
		try {
			this.state = 288;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 35, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 270;
				this.match(AntimonyParser.AT);
				this.state = 271;
				_localctx._trigger = this.formula(0);
				this.state = 273;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === AntimonyParser.T__3) {
					{
					this.state = 272;
					this.eventOptions();
					}
				}

				this.state = 275;
				this.match(AntimonyParser.T__12);
				this.state = 276;
				this.eventAssignments();
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 278;
				this.match(AntimonyParser.AT);
				this.state = 279;
				_localctx._delay = this.formula(0);
				this.state = 280;
				this.match(AntimonyParser.AFTER);
				this.state = 281;
				_localctx._trigger = this.formula(0);
				this.state = 283;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === AntimonyParser.T__3) {
					{
					this.state = 282;
					this.eventOptions();
					}
				}

				this.state = 285;
				this.match(AntimonyParser.T__12);
				this.state = 286;
				this.eventAssignments();
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
		this.enterRule(_localctx, 42, AntimonyParser.RULE_eventOptions);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 292;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			do {
				{
				{
				this.state = 290;
				this.match(AntimonyParser.T__3);
				this.state = 291;
				this.eventOption();
				}
				}
				this.state = 294;
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
		this.enterRule(_localctx, 44, AntimonyParser.RULE_eventOption);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 296;
			this.match(AntimonyParser.NAME);
			this.state = 297;
			this.match(AntimonyParser.T__14);
			this.state = 298;
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
		this.enterRule(_localctx, 46, AntimonyParser.RULE_eventAssignments);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 303;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === AntimonyParser.NEWLINE) {
				{
				{
				this.state = 300;
				this.match(AntimonyParser.NEWLINE);
				}
				}
				this.state = 305;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 306;
			this.eventAssignment();
			this.state = 311;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === AntimonyParser.T__3) {
				{
				{
				this.state = 307;
				this.match(AntimonyParser.T__3);
				this.state = 308;
				this.eventAssignment();
				}
				}
				this.state = 313;
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
		this.enterRule(_localctx, 48, AntimonyParser.RULE_eventAssignment);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 314;
			this.variable(0);
			this.state = 315;
			this.match(AntimonyParser.T__14);
			this.state = 316;
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
	public annotation(): AnnotationContext {
		let _localctx: AnnotationContext = new AnnotationContext(this._ctx, this.state);
		this.enterRule(_localctx, 50, AntimonyParser.RULE_annotation);
		try {
			this.state = 321;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 39, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 318;
				this.variableAnnotation();
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 319;
				this.hasAnnotation();
				}
				break;

			case 3:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 320;
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
		this.enterRule(_localctx, 52, AntimonyParser.RULE_variableAnnotation);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 323;
			this.variable(0);
			this.state = 324;
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
		this.enterRule(_localctx, 54, AntimonyParser.RULE_hasAnnotation);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 326;
			this.variable(0);
			this.state = 327;
			this.match(AntimonyParser.HAS);
			this.state = 328;
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
		this.enterRule(_localctx, 56, AntimonyParser.RULE_modelAnnotation);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 330;
			this.match(AntimonyParser.MODEL);
			this.state = 332;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 40, this._ctx) ) {
			case 1:
				{
				this.state = 331;
				this.match(AntimonyParser.NAME);
				}
				break;
			}
			this.state = 334;
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
		this.enterRule(_localctx, 58, AntimonyParser.RULE_annotationBody);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 336;
			this.annotationItem();
			this.state = 337;
			this.string();
			this.state = 345;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === AntimonyParser.T__3) {
				{
				{
				this.state = 338;
				this.match(AntimonyParser.T__3);
				this.state = 340;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === AntimonyParser.NEWLINE) {
					{
					this.state = 339;
					this.match(AntimonyParser.NEWLINE);
					}
				}

				this.state = 342;
				this.string();
				}
				}
				this.state = 347;
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
		this.enterRule(_localctx, 60, AntimonyParser.RULE_annotationItem);
		try {
			this.state = 352;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 43, this._ctx) ) {
			case 1:
				_localctx = new AnnotationNameContext(_localctx);
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 348;
				this.match(AntimonyParser.NAME);
				}
				break;

			case 2:
				_localctx = new AnnotationSubItemContext(_localctx);
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 349;
				this.match(AntimonyParser.NAME);
				this.state = 350;
				this.match(AntimonyParser.T__10);
				this.state = 351;
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
		this.enterRule(_localctx, 62, AntimonyParser.RULE_string);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 354;
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
		this.enterRule(_localctx, 64, AntimonyParser.RULE_unitDeclaration);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 356;
			this.match(AntimonyParser.UNIT);
			this.state = 357;
			this.match(AntimonyParser.NAME);
			this.state = 360;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === AntimonyParser.T__14) {
				{
				this.state = 358;
				this.match(AntimonyParser.T__14);
				this.state = 359;
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
		let _startState: number = 66;
		this.enterRecursionRule(_localctx, 66, AntimonyParser.RULE_unitFormula, _p);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 377;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case AntimonyParser.T__2:
				{
				_localctx = new UnitGroupContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;

				this.state = 363;
				this.match(AntimonyParser.T__2);
				this.state = 364;
				this.unitFormula(0);
				this.state = 365;
				this.match(AntimonyParser.T__4);
				}
				break;
			case AntimonyParser.NUMBER:
				{
				_localctx = new UnitNumberContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 367;
				this.match(AntimonyParser.NUMBER);
				this.state = 369;
				this._errHandler.sync(this);
				switch ( this.interpreter.adaptivePredict(this._input, 45, this._ctx) ) {
				case 1:
					{
					this.state = 368;
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
				this.state = 371;
				this.match(AntimonyParser.NAME);
				}
				break;
			case AntimonyParser.STRING:
			case AntimonyParser.LONG_STRING:
				{
				_localctx = new UnitNameContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 372;
				this.string();
				}
				break;
			case AntimonyParser.T__5:
				{
				_localctx = new UnitPositiveContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 373;
				this.match(AntimonyParser.T__5);
				this.state = 374;
				this.unitFormula(5);
				}
				break;
			case AntimonyParser.T__6:
				{
				_localctx = new UnitNegativeContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 375;
				this.match(AntimonyParser.T__6);
				this.state = 376;
				this.unitFormula(4);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			this._ctx._stop = this._input.tryLT(-1);
			this.state = 390;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 48, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = _localctx;
					{
					this.state = 388;
					this._errHandler.sync(this);
					switch ( this.interpreter.adaptivePredict(this._input, 47, this._ctx) ) {
					case 1:
						{
						_localctx = new UnitPowerContext(new UnitFormulaContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, AntimonyParser.RULE_unitFormula);
						this.state = 379;
						if (!(this.precpred(this._ctx, 3))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 3)");
						}
						this.state = 380;
						this.match(AntimonyParser.T__7);
						this.state = 381;
						this.unitFormula(3);
						}
						break;

					case 2:
						{
						_localctx = new UnitProductContext(new UnitFormulaContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, AntimonyParser.RULE_unitFormula);
						this.state = 382;
						if (!(this.precpred(this._ctx, 2))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 2)");
						}
						this.state = 383;
						(_localctx as UnitProductContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if (!((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << AntimonyParser.T__1) | (1 << AntimonyParser.T__8) | (1 << AntimonyParser.T__9))) !== 0))) {
							(_localctx as UnitProductContext)._op = this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						this.state = 384;
						this.unitFormula(3);
						}
						break;

					case 3:
						{
						_localctx = new UnitSumContext(new UnitFormulaContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, AntimonyParser.RULE_unitFormula);
						this.state = 385;
						if (!(this.precpred(this._ctx, 1))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 1)");
						}
						this.state = 386;
						(_localctx as UnitSumContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if (!(_la === AntimonyParser.T__5 || _la === AntimonyParser.T__6)) {
							(_localctx as UnitSumContext)._op = this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						this.state = 387;
						this.unitFormula(2);
						}
						break;
					}
					}
				}
				this.state = 392;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 48, this._ctx);
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
	public modelCall(): ModelCallContext {
		let _localctx: ModelCallContext = new ModelCallContext(this._ctx, this.state);
		this.enterRule(_localctx, 68, AntimonyParser.RULE_modelCall);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 393;
			this.reactionName();
			this.state = 394;
			this.match(AntimonyParser.NAME);
			this.state = 395;
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
		case 7:
			return this.formula_sempred(_localctx as FormulaContext, predIndex);

		case 10:
			return this.variable_sempred(_localctx as VariableContext, predIndex);

		case 33:
			return this.unitFormula_sempred(_localctx as UnitFormulaContext, predIndex);
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
		"\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x03\'\u0190\x04\x02" +
		"\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06\x04\x07" +
		"\t\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04\v\t\v\x04\f\t\f\x04\r\t\r\x04" +
		"\x0E\t\x0E\x04\x0F\t\x0F\x04\x10\t\x10\x04\x11\t\x11\x04\x12\t\x12\x04" +
		"\x13\t\x13\x04\x14\t\x14\x04\x15\t\x15\x04\x16\t\x16\x04\x17\t\x17\x04" +
		"\x18\t\x18\x04\x19\t\x19\x04\x1A\t\x1A\x04\x1B\t\x1B\x04\x1C\t\x1C\x04" +
		"\x1D\t\x1D\x04\x1E\t\x1E\x04\x1F\t\x1F\x04 \t \x04!\t!\x04\"\t\"\x04#" +
		"\t#\x04$\t$\x03\x02\x05\x02J\n\x02\x03\x02\x03\x02\x05\x02N\n\x02\x07" +
		"\x02P\n\x02\f\x02\x0E\x02S\v\x02\x03\x02\x03\x02\x03\x03\x03\x03\x03\x04" +
		"\x03\x04\x05\x04[\n\x04\x03\x05\x05\x05^\n\x05\x03\x05\x06\x05a\n\x05" +
		"\r\x05\x0E\x05b\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06" +
		"\x05\x06l\n\x06\x03\x07\x03\x07\x05\x07p\n\x07\x03\x07\x03\x07\x05\x07" +
		"t\n\x07\x03\x07\x03\x07\x03\x07\x03\b\x03\b\x03\b\x03\b\x07\b}\n\b\f\b" +
		"\x0E\b\x80\v\b\x05\b\x82\n\b\x03\b\x03\b\x03\t\x03\t\x03\t\x03\t\x03\t" +
		"\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x05\t\x92\n\t\x03\t\x03\t\x03" +
		"\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03" +
		"\t\x07\t\xA3\n\t\f\t\x0E\t\xA6\v\t\x03\n\x03\n\x03\n\x05\n\xAB\n\n\x03" +
		"\n\x03\n\x03\v\x03\v\x03\v\x07\v\xB2\n\v\f\v\x0E\v\xB5\v\v\x03\f\x03\f" +
		"\x03\f\x03\f\x05\f\xBB\n\f\x03\f\x03\f\x03\f\x07\f\xC0\n\f\f\f\x0E\f\xC3" +
		"\v\f\x03\r\x03\r\x03\r\x03\x0E\x05\x0E\xC9\n\x0E\x03\x0E\x03\x0E\x03\x0E" +
		"\x05\x0E\xCE\n\x0E\x03\x0E\x05\x0E\xD1\n\x0E\x03\x0F\x03\x0F\x05\x0F\xD5" +
		"\n\x0F\x03\x0F\x03\x0F\x03\x10\x05\x10\xDA\n\x10\x03\x10\x03\x10\x03\x10" +
		"\x03\x10\x03\x10\x05\x10\xE1\n\x10\x05\x10\xE3\n\x10\x03\x11\x03\x11\x03" +
		"\x11\x07\x11\xE8\n\x11\f\x11\x0E\x11\xEB\v\x11\x03\x12\x05\x12\xEE\n\x12" +
		"\x03\x12\x03\x12\x03\x13\x03\x13\x05\x13\xF4\n\x13\x03\x13\x05\x13\xF7" +
		"\n\x13\x03\x13\x03\x13\x03\x13\x03\x14\x03\x14\x03\x14\x03\x14\x05\x14" +
		"\u0100\n\x14\x03\x14\x03\x14\x03\x14\x07\x14\u0105\n\x14\f\x14\x0E\x14" +
		"\u0108\v\x14\x03\x15\x03\x15\x03\x15\x05\x15\u010D\n\x15\x05\x15\u010F" +
		"\n\x15\x03\x16\x03\x16\x03\x16\x05\x16\u0114\n\x16\x03\x16\x03\x16\x03" +
		"\x16\x03\x16\x03\x16\x03\x16\x03\x16\x03\x16\x05\x16\u011E\n\x16\x03\x16" +
		"\x03\x16\x03\x16\x05\x16\u0123\n\x16\x03\x17\x03\x17\x06\x17\u0127\n\x17" +
		"\r\x17\x0E\x17\u0128\x03\x18\x03\x18\x03\x18\x03\x18\x03\x19\x07\x19\u0130" +
		"\n\x19\f\x19\x0E\x19\u0133\v\x19\x03\x19\x03\x19\x03\x19\x07\x19\u0138" +
		"\n\x19\f\x19\x0E\x19\u013B\v\x19\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1B" +
		"\x03\x1B\x03\x1B\x05\x1B\u0144\n\x1B\x03\x1C\x03\x1C\x03\x1C\x03\x1D\x03" +
		"\x1D\x03\x1D\x03\x1D\x03\x1E\x03\x1E\x05\x1E\u014F\n\x1E\x03\x1E\x03\x1E" +
		"\x03\x1F\x03\x1F\x03\x1F\x03\x1F\x05\x1F\u0157\n\x1F\x03\x1F\x07\x1F\u015A" +
		"\n\x1F\f\x1F\x0E\x1F\u015D\v\x1F\x03 \x03 \x03 \x03 \x05 \u0163\n \x03" +
		"!\x03!\x03\"\x03\"\x03\"\x03\"\x05\"\u016B\n\"\x03#\x03#\x03#\x03#\x03" +
		"#\x03#\x03#\x05#\u0174\n#\x03#\x03#\x03#\x03#\x03#\x03#\x05#\u017C\n#" +
		"\x03#\x03#\x03#\x03#\x03#\x03#\x03#\x03#\x03#\x07#\u0187\n#\f#\x0E#\u018A" +
		"\v#\x03$\x03$\x03$\x03$\x03$\x02\x02\x05\x10\x16D%\x02\x02\x04\x02\x06" +
		"\x02\b\x02\n\x02\f\x02\x0E\x02\x10\x02\x12\x02\x14\x02\x16\x02\x18\x02" +
		"\x1A\x02\x1C\x02\x1E\x02 \x02\"\x02$\x02&\x02(\x02*\x02,\x02.\x020\x02" +
		"2\x024\x026\x028\x02:\x02<\x02>\x02@\x02B\x02D\x02F\x02\x02\x07\x04\x02" +
		"\x03\x03$$\x04\x02\x04\x04\v\f\x03\x02\b\t\x03\x02\x0F\x10\x03\x02\"#" +
		"\x02\u01B0\x02I\x03\x02\x02\x02\x04V\x03\x02\x02\x02\x06Z\x03\x02\x02" +
		"\x02\b`\x03\x02\x02\x02\nk\x03\x02\x02\x02\fm\x03\x02\x02\x02\x0Ex\x03" +
		"\x02\x02\x02\x10\x91\x03\x02\x02\x02\x12\xA7\x03\x02\x02\x02\x14\xAE\x03" +
		"\x02\x02\x02\x16\xBA\x03\x02\x02\x02\x18\xC4\x03\x02\x02\x02\x1A\xC8\x03" +
		"\x02\x02\x02\x1C\xD2\x03\x02\x02\x02\x1E\xE2\x03\x02\x02\x02 \xE4\x03" +
		"\x02\x02\x02\"\xED\x03\x02\x02\x02$\xF1\x03\x02\x02\x02&\xFF\x03\x02\x02" +
		"\x02(\u010E\x03\x02\x02\x02*\u0122\x03\x02\x02\x02,\u0126\x03\x02\x02" +
		"\x02.\u012A\x03\x02\x02\x020\u0131\x03\x02\x02\x022\u013C\x03\x02\x02" +
		"\x024\u0143\x03\x02\x02\x026\u0145\x03\x02\x02\x028\u0148\x03\x02\x02" +
		"\x02:\u014C\x03\x02\x02\x02<\u0152\x03\x02\x02\x02>\u0162\x03\x02\x02" +
		"\x02@\u0164\x03\x02\x02\x02B\u0166\x03\x02\x02\x02D\u017B\x03\x02\x02" +
		"\x02F\u018B\x03\x02\x02\x02HJ\x05\x06\x04\x02IH\x03\x02\x02\x02IJ\x03" +
		"\x02\x02\x02JQ\x03\x02\x02\x02KM\x05\x04\x03\x02LN\x05\x06\x04\x02ML\x03" +
		"\x02\x02\x02MN\x03\x02\x02\x02NP\x03\x02\x02\x02OK\x03\x02\x02\x02PS\x03" +
		"\x02\x02\x02QO\x03\x02\x02\x02QR\x03\x02\x02\x02RT\x03\x02\x02\x02SQ\x03" +
		"\x02\x02\x02TU\x07\x02\x02\x03U\x03\x03\x02\x02\x02VW\t\x02\x02\x02W\x05" +
		"\x03\x02\x02\x02X[\x05\f\x07\x02Y[\x05\n\x06\x02ZX\x03\x02\x02\x02ZY\x03" +
		"\x02\x02\x02[\x07\x03\x02\x02\x02\\^\x05\n\x06\x02]\\\x03\x02\x02\x02" +
		"]^\x03\x02\x02\x02^_\x03\x02\x02\x02_a\x05\x04\x03\x02`]\x03\x02\x02\x02" +
		"ab\x03\x02\x02\x02b`\x03\x02\x02\x02bc\x03\x02\x02\x02c\t\x03\x02\x02" +
		"\x02dl\x05\x1A\x0E\x02el\x05$\x13\x02fl\x05&\x14\x02gl\x05F$\x02hl\x05" +
		"*\x16\x02il\x054\x1B\x02jl\x05B\"\x02kd\x03\x02\x02\x02ke\x03\x02\x02" +
		"\x02kf\x03\x02\x02\x02kg\x03\x02\x02\x02kh\x03\x02\x02\x02ki\x03\x02\x02" +
		"\x02kj\x03\x02\x02\x02l\v\x03\x02\x02\x02mo\x07\x12\x02\x02np\x07\x04" +
		"\x02\x02on\x03\x02\x02\x02op\x03\x02\x02\x02pq\x03\x02\x02\x02qs\x07\x1B" +
		"\x02\x02rt\x05\x0E\b\x02sr\x03\x02\x02\x02st\x03\x02\x02\x02tu\x03\x02" +
		"\x02\x02uv\x05\b\x05\x02vw\x07\x13\x02\x02w\r\x03\x02\x02\x02x\x81\x07" +
		"\x05\x02\x02y~\x05\x16\f\x02z{\x07\x06\x02\x02{}\x05\x16\f\x02|z\x03\x02" +
		"\x02\x02}\x80\x03\x02\x02\x02~|\x03\x02\x02\x02~\x7F\x03\x02\x02\x02\x7F" +
		"\x82\x03\x02\x02\x02\x80~\x03\x02\x02\x02\x81y\x03\x02\x02\x02\x81\x82" +
		"\x03\x02\x02\x02\x82\x83\x03\x02\x02\x02\x83\x84\x07\x07\x02\x02\x84\x0F" +
		"\x03\x02\x02\x02\x85\x86\b\t\x01\x02\x86\x87\x07\x05\x02\x02\x87\x88\x05" +
		"\x10\t\x02\x88\x89\x07\x07\x02\x02\x89\x92\x03\x02\x02\x02\x8A\x92\x07" +
		"\x1C\x02\x02\x8B\x92\x05\x12\n\x02\x8C\x92\x05\x16\f\x02\x8D\x8E\x07\b" +
		"\x02\x02\x8E\x92\x05\x10\t\t\x8F\x90\x07\t\x02\x02\x90\x92\x05\x10\t\b" +
		"\x91\x85\x03\x02\x02\x02\x91\x8A\x03\x02\x02\x02\x91\x8B\x03\x02\x02\x02" +
		"\x91\x8C\x03\x02\x02\x02\x91\x8D\x03\x02\x02\x02\x91\x8F\x03\x02\x02\x02" +
		"\x92\xA4\x03\x02\x02\x02\x93\x94\f\x07\x02\x02\x94\x95\x07\n\x02\x02\x95" +
		"\xA3\x05\x10\t\x07\x96\x97\f\x06\x02\x02\x97\x98\t\x03\x02\x02\x98\xA3" +
		"\x05\x10\t\x07\x99\x9A\f\x05\x02\x02\x9A\x9B\t\x04\x02\x02\x9B\xA3\x05" +
		"\x10\t\x06\x9C\x9D\f\x04\x02\x02\x9D\x9E\x07 \x02\x02\x9E\xA3\x05\x10" +
		"\t\x05\x9F\xA0\f\x03\x02\x02\xA0\xA1\x07!\x02\x02\xA1\xA3\x05\x10\t\x04" +
		"\xA2\x93\x03\x02\x02\x02\xA2\x96\x03\x02\x02\x02\xA2\x99\x03\x02\x02\x02" +
		"\xA2\x9C\x03\x02\x02\x02\xA2\x9F\x03\x02\x02\x02\xA3\xA6\x03\x02\x02\x02" +
		"\xA4\xA2\x03\x02\x02\x02\xA4\xA5\x03\x02\x02\x02\xA5\x11\x03\x02\x02\x02" +
		"\xA6\xA4\x03\x02\x02\x02\xA7\xA8\x07\x1B\x02\x02\xA8\xAA\x07\x05\x02\x02" +
		"\xA9\xAB\x05\x14\v\x02\xAA\xA9\x03\x02\x02\x02\xAA\xAB\x03\x02\x02\x02" +
		"\xAB\xAC\x03\x02\x02\x02\xAC\xAD\x07\x07\x02\x02\xAD\x13\x03\x02\x02\x02" +
		"\xAE\xB3\x05\x10\t\x02\xAF\xB0\x07\x06\x02\x02\xB0\xB2\x05\x10\t\x02\xB1" +
		"\xAF\x03\x02\x02\x02\xB2\xB5\x03\x02\x02\x02\xB3\xB1\x03\x02\x02\x02\xB3" +
		"\xB4\x03\x02\x02\x02\xB4\x15\x03\x02\x02\x02\xB5\xB3\x03\x02\x02\x02\xB6" +
		"\xB7\b\f\x01\x02\xB7\xBB\x07\x1B\x02\x02\xB8\xB9\x07\x0E\x02\x02\xB9\xBB" +
		"\x05\x16\f\x03\xBA\xB6\x03\x02\x02\x02\xBA\xB8\x03\x02\x02\x02\xBB\xC1" +
		"\x03\x02\x02\x02\xBC\xBD\f\x04\x02\x02\xBD\xBE\x07\r\x02\x02\xBE\xC0\x07" +
		"\x1B\x02\x02\xBF\xBC\x03\x02\x02\x02\xC0\xC3\x03\x02\x02\x02\xC1\xBF\x03" +
		"\x02\x02\x02\xC1\xC2\x03\x02\x02\x02\xC2\x17\x03\x02\x02\x02\xC3\xC1\x03" +
		"\x02\x02\x02\xC4\xC5\x07\x14\x02\x02\xC5\xC6\x05\x16\f\x02\xC6\x19\x03" +
		"\x02\x02\x02\xC7\xC9\x05\x1C\x0F\x02\xC8\xC7\x03\x02\x02\x02\xC8\xC9\x03" +
		"\x02\x02\x02\xC9\xCA\x03\x02\x02\x02\xCA\xCB\x05\x1E\x10\x02\xCB\xCD\x07" +
		"\x03\x02\x02\xCC\xCE\x05\x10\t\x02\xCD\xCC\x03\x02\x02\x02\xCD\xCE\x03" +
		"\x02\x02\x02\xCE\xD0\x03\x02\x02\x02\xCF\xD1\x05\x18\r\x02\xD0\xCF\x03" +
		"\x02\x02\x02\xD0\xD1\x03\x02\x02\x02\xD1\x1B\x03\x02\x02\x02\xD2\xD4\x07" +
		"\x1B\x02\x02\xD3\xD5\x05\x18\r\x02\xD4\xD3\x03\x02\x02\x02\xD4\xD5\x03" +
		"\x02\x02\x02\xD5\xD6\x03\x02\x02\x02\xD6\xD7\x07\x0F\x02\x02\xD7\x1D\x03" +
		"\x02\x02\x02\xD8\xDA\x05 \x11\x02\xD9\xD8\x03\x02\x02\x02\xD9\xDA\x03" +
		"\x02\x02\x02\xDA\xDB\x03\x02\x02\x02\xDB\xDC\x07\x1D\x02\x02\xDC\xE3\x05" +
		" \x11\x02\xDD\xDE\x05 \x11\x02\xDE\xE0\x07\x1D\x02\x02\xDF\xE1\x05 \x11" +
		"\x02\xE0\xDF\x03\x02\x02\x02\xE0\xE1\x03\x02\x02\x02\xE1\xE3\x03\x02\x02" +
		"\x02\xE2\xD9\x03\x02\x02\x02\xE2\xDD\x03\x02\x02\x02\xE3\x1F\x03\x02\x02" +
		"\x02\xE4\xE9\x05\"\x12\x02\xE5\xE6\x07\b\x02\x02\xE6\xE8\x05\"\x12\x02" +
		"\xE7\xE5\x03\x02\x02\x02\xE8\xEB\x03\x02\x02\x02\xE9\xE7\x03\x02\x02\x02" +
		"\xE9\xEA\x03\x02\x02\x02\xEA!\x03\x02\x02\x02\xEB\xE9\x03\x02\x02\x02" +
		"\xEC\xEE\x07\x1C\x02\x02\xED\xEC\x03\x02\x02\x02\xED\xEE\x03\x02\x02\x02" +
		"\xEE\xEF\x03\x02\x02\x02\xEF\xF0\x05\x16\f\x02\xF0#\x03\x02\x02\x02\xF1" +
		"\xF3\x05\x16\f\x02\xF2\xF4\x05\x18\r\x02\xF3\xF2\x03\x02\x02\x02\xF3\xF4" +
		"\x03\x02\x02\x02\xF4\xF6\x03\x02\x02\x02\xF5\xF7\t\x05\x02\x02\xF6\xF5" +
		"\x03\x02\x02\x02\xF6\xF7\x03\x02\x02\x02\xF7\xF8\x03\x02\x02\x02\xF8\xF9" +
		"\x07\x11\x02\x02\xF9\xFA\x05\x10\t\x02\xFA%\x03\x02\x02\x02\xFB\xFC\x07" +
		"\x19\x02\x02\xFC\u0100\x07\x1A\x02\x02\xFD\u0100\x07\x1A\x02\x02\xFE\u0100" +
		"\x07\x19\x02\x02\xFF\xFB\x03\x02\x02\x02\xFF\xFD\x03\x02\x02\x02\xFF\xFE" +
		"\x03\x02\x02\x02\u0100\u0101\x03\x02\x02\x02\u0101\u0106\x05(\x15\x02" +
		"\u0102\u0103\x07\x06\x02\x02\u0103\u0105\x05(\x15\x02\u0104\u0102\x03" +
		"\x02\x02\x02\u0105\u0108\x03\x02\x02\x02\u0106\u0104\x03\x02\x02\x02\u0106" +
		"\u0107\x03\x02\x02\x02\u0107\'\x03\x02\x02\x02\u0108\u0106\x03\x02\x02" +
		"\x02\u0109\u010F\x05$\x13\x02\u010A\u010C\x05\x16\f\x02\u010B\u010D\x05" +
		"\x18\r\x02\u010C\u010B\x03\x02\x02\x02\u010C\u010D\x03\x02\x02\x02\u010D" +
		"\u010F\x03\x02\x02\x02\u010E\u0109\x03\x02\x02\x02\u010E\u010A\x03\x02" +
		"\x02\x02\u010F)\x03\x02\x02\x02\u0110\u0111\x07\x15\x02\x02\u0111\u0113" +
		"\x05\x10\t\x02\u0112\u0114\x05,\x17\x02\u0113\u0112\x03\x02\x02\x02\u0113" +
		"\u0114\x03\x02\x02\x02\u0114\u0115\x03\x02\x02\x02\u0115\u0116\x07\x0F" +
		"\x02\x02\u0116\u0117\x050\x19\x02\u0117\u0123\x03\x02\x02\x02\u0118\u0119" +
		"\x07\x15\x02\x02\u0119\u011A\x05\x10\t\x02\u011A\u011B\x07\x16\x02\x02" +
		"\u011B\u011D\x05\x10\t\x02\u011C\u011E\x05,\x17\x02\u011D\u011C\x03\x02" +
		"\x02\x02\u011D\u011E\x03\x02\x02\x02\u011E\u011F\x03\x02\x02\x02\u011F" +
		"\u0120\x07\x0F\x02\x02\u0120\u0121\x050\x19\x02\u0121\u0123\x03\x02\x02" +
		"\x02\u0122\u0110\x03\x02\x02\x02\u0122\u0118\x03\x02\x02\x02\u0123+\x03" +
		"\x02\x02\x02\u0124\u0125\x07\x06\x02\x02\u0125\u0127\x05.\x18\x02\u0126" +
		"\u0124\x03\x02\x02\x02\u0127\u0128\x03\x02\x02\x02\u0128\u0126\x03\x02" +
		"\x02\x02\u0128\u0129\x03\x02\x02\x02\u0129-\x03\x02\x02\x02\u012A\u012B" +
		"\x07\x1B\x02\x02\u012B\u012C\x07\x11\x02\x02\u012C\u012D\x05\x10\t\x02" +
		"\u012D/\x03\x02\x02\x02\u012E\u0130\x07$\x02\x02\u012F\u012E\x03\x02\x02" +
		"\x02\u0130\u0133\x03\x02\x02\x02\u0131\u012F\x03\x02\x02\x02\u0131\u0132" +
		"\x03\x02\x02\x02\u0132\u0134\x03\x02\x02\x02\u0133\u0131\x03\x02\x02\x02" +
		"\u0134\u0139\x052\x1A\x02\u0135\u0136\x07\x06\x02\x02\u0136\u0138\x05" +
		"2\x1A\x02\u0137\u0135\x03\x02\x02\x02\u0138\u013B\x03\x02\x02\x02\u0139" +
		"\u0137\x03\x02\x02\x02\u0139\u013A\x03\x02\x02\x02\u013A1\x03\x02\x02" +
		"\x02\u013B\u0139\x03\x02\x02\x02\u013C\u013D\x05\x16\f\x02\u013D\u013E" +
		"\x07\x11\x02\x02\u013E\u013F\x05\x10\t\x02\u013F3\x03\x02\x02\x02\u0140" +
		"\u0144\x056\x1C\x02\u0141\u0144\x058\x1D\x02\u0142\u0144\x05:\x1E\x02" +
		"\u0143\u0140\x03\x02\x02\x02\u0143\u0141\x03\x02\x02\x02\u0143\u0142\x03" +
		"\x02\x02\x02\u01445\x03\x02\x02\x02\u0145\u0146\x05\x16\f\x02\u0146\u0147" +
		"\x05<\x1F\x02\u01477\x03\x02\x02\x02\u0148\u0149\x05\x16\f\x02\u0149\u014A" +
		"\x07\x18\x02\x02\u014A\u014B\x05D#\x02\u014B9\x03\x02\x02\x02\u014C\u014E" +
		"\x07\x12\x02\x02\u014D\u014F\x07\x1B\x02\x02\u014E\u014D\x03\x02\x02\x02" +
		"\u014E\u014F\x03\x02\x02\x02\u014F\u0150\x03\x02\x02\x02\u0150\u0151\x05" +
		"<\x1F\x02\u0151;\x03\x02\x02\x02\u0152\u0153\x05> \x02\u0153\u015B\x05" +
		"@!\x02\u0154\u0156\x07\x06\x02\x02\u0155\u0157\x07$\x02\x02\u0156\u0155" +
		"\x03\x02\x02\x02\u0156\u0157\x03\x02\x02\x02\u0157\u0158\x03\x02\x02\x02" +
		"\u0158\u015A\x05@!\x02\u0159\u0154\x03\x02\x02\x02\u015A\u015D\x03\x02" +
		"\x02\x02\u015B\u0159\x03\x02\x02\x02\u015B\u015C\x03\x02\x02\x02\u015C" +
		"=\x03\x02\x02\x02\u015D\u015B\x03\x02\x02\x02\u015E\u0163\x07\x1B\x02" +
		"\x02\u015F\u0160\x07\x1B\x02\x02\u0160\u0161\x07\r\x02\x02\u0161\u0163" +
		"\x05> \x02\u0162\u015E\x03\x02\x02\x02\u0162\u015F\x03\x02\x02\x02\u0163" +
		"?\x03\x02\x02\x02\u0164\u0165\t\x06\x02\x02\u0165A\x03\x02\x02\x02\u0166" +
		"\u0167\x07\x17\x02\x02\u0167\u016A\x07\x1B\x02\x02\u0168\u0169\x07\x11" +
		"\x02\x02\u0169\u016B\x05D#\x02\u016A\u0168\x03\x02\x02\x02\u016A\u016B" +
		"\x03\x02\x02\x02\u016BC\x03\x02\x02\x02\u016C\u016D\b#\x01\x02\u016D\u016E" +
		"\x07\x05\x02\x02\u016E\u016F\x05D#\x02\u016F\u0170\x07\x07\x02\x02\u0170" +
		"\u017C\x03\x02\x02\x02\u0171\u0173\x07\x1C\x02\x02\u0172\u0174\x07\x1B" +
		"\x02\x02\u0173\u0172\x03\x02\x02\x02\u0173\u0174\x03\x02\x02\x02\u0174" +
		"\u017C\x03\x02\x02\x02\u0175\u017C\x07\x1B\x02\x02\u0176\u017C\x05@!\x02" +
		"\u0177\u0178\x07\b\x02\x02\u0178\u017C\x05D#\x07\u0179\u017A\x07\t\x02" +
		"\x02\u017A\u017C\x05D#\x06\u017B\u016C\x03\x02\x02\x02\u017B\u0171\x03" +
		"\x02\x02\x02\u017B\u0175\x03\x02\x02\x02\u017B\u0176\x03\x02\x02\x02\u017B" +
		"\u0177\x03\x02\x02\x02\u017B\u0179\x03\x02\x02\x02\u017C\u0188\x03\x02" +
		"\x02\x02\u017D\u017E\f\x05\x02\x02\u017E\u017F\x07\n\x02\x02\u017F\u0187" +
		"\x05D#\x05\u0180\u0181\f\x04\x02\x02\u0181\u0182\t\x03\x02\x02\u0182\u0187" +
		"\x05D#\x05\u0183\u0184\f\x03\x02\x02\u0184\u0185\t\x04\x02\x02\u0185\u0187" +
		"\x05D#\x04\u0186\u017D\x03\x02\x02\x02\u0186\u0180\x03\x02\x02\x02\u0186" +
		"\u0183\x03\x02\x02\x02\u0187\u018A\x03\x02\x02\x02\u0188\u0186\x03\x02" +
		"\x02\x02\u0188\u0189\x03\x02\x02\x02\u0189E\x03\x02\x02\x02\u018A\u0188" +
		"\x03\x02\x02\x02\u018B\u018C\x05\x1C\x0F\x02\u018C\u018D\x07\x1B\x02\x02" +
		"\u018D\u018E\x05\x0E\b\x02\u018EG\x03\x02\x02\x023IMQZ]bkos~\x81\x91\xA2" +
		"\xA4\xAA\xB3\xBA\xC1\xC8\xCD\xD0\xD4\xD9\xE0\xE2\xE9\xED\xF3\xF6\xFF\u0106" +
		"\u010C\u010E\u0113\u011D\u0122\u0128\u0131\u0139\u0143\u014E\u0156\u015B" +
		"\u0162\u016A\u0173\u017B\u0186\u0188";
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
	public modelCall(): ModelCallContext | undefined {
		return this.tryGetRuleContext(0, ModelCallContext);
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


export class AssignmentContext extends ParserRuleContext {
	public _mod!: Token;
	public variable(): VariableContext {
		return this.getRuleContext(0, VariableContext);
	}
	public formula(): FormulaContext {
		return this.getRuleContext(0, FormulaContext);
	}
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


export class DeclarationContext extends ParserRuleContext {
	public declarationTerm(): DeclarationTermContext[];
	public declarationTerm(i: number): DeclarationTermContext;
	public declarationTerm(i?: number): DeclarationTermContext | DeclarationTermContext[] {
		if (i === undefined) {
			return this.getRuleContexts(DeclarationTermContext);
		} else {
			return this.getRuleContext(i, DeclarationTermContext);
		}
	}
	public DECL_WORD(): TerminalNode | undefined { return this.tryGetToken(AntimonyParser.DECL_WORD, 0); }
	public CONST_MODIFIER(): TerminalNode | undefined { return this.tryGetToken(AntimonyParser.CONST_MODIFIER, 0); }
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
	public eventAssignments(): EventAssignmentsContext {
		return this.getRuleContext(0, EventAssignmentsContext);
	}
	public formula(): FormulaContext[];
	public formula(i: number): FormulaContext;
	public formula(i?: number): FormulaContext | FormulaContext[] {
		if (i === undefined) {
			return this.getRuleContexts(FormulaContext);
		} else {
			return this.getRuleContext(i, FormulaContext);
		}
	}
	public eventOptions(): EventOptionsContext | undefined {
		return this.tryGetRuleContext(0, EventOptionsContext);
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


