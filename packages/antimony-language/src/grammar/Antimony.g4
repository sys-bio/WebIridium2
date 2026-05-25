grammar Antimony;
import AntimonyLexer;

root : topLevelStatement? (statementSeparator topLevelStatement?)* EOF;
statementSeparator : ';' | NEWLINE;
topLevelStatement : model | statement;

statementList : (statement? statementSeparator)+;
statement : reaction
          | assignment
          | declaration
          | modelCall
          | event
          | annotation
          | unitDeclaration
          ;

// e.g
// model Test(A, B)
//    
// end
model : MODEL '*'? NAME exportList? statementList END;
exportList : '(' (variable (',' variable)* )? ')';

formula : '(' formula ')' #group
        | NUMBER #number
        | functionCall #call
        | variable #var
        | '+' formula #positive
        | '-' formula #negative
        // | 'exp' formula #exp // does not seem to actually be valid, but it was in the old grammars
        | <assoc=right> formula '^' formula #power
        | formula op=('*' | '/' | '%') formula #product
        | formula op=('+' | '-') formula #sum
        | formula op=COMPARE formula #compare
        | formula op=LOGICAL formula #logical
        ;

functionCall : NAME '(' parameterList? ')';
parameterList : formula (',' formula)*;

variable : NAME #name
         | variable '.' NAME #subvariable
         | '$' variable #constant
         ;

inCompartment : IN variable;

// e.g "J1 in compartment1: 2 A + 4 B -> C; k1*20"
reaction        : reactionName? reactionFormula ';' formula? inCompartment?;
reactionName    : NAME inCompartment? ':';
reactionFormula : left=reactantList? ARROW right=reactantList
                | left=reactantList ARROW right=reactantList?
                ;
reactantList : reactant ('+' reactant)*;
reactant : NUMBER? variable;

assignment : variable inCompartment? apostrophe='\''? op=ASSIGNMENT formula;

declaration     : ((CONST_MODIFIER DECL_WORD) | DECL_WORD | CONST_MODIFIER) declarationTerm (',' declarationTerm)*;
declarationTerm : assignment #declarationAssignment
                | variable inCompartment? #declarationName
                ;

event           : AT formula ':' NEWLINE* eventAssignment (',' eventAssignment)*;
eventAssignment : variable ASSIGNMENT formula;

annotation         : variableAnnotation | hasAnnotation | modelAnnotation;
variableAnnotation : variable annotationBody;
hasAnnotation      : variable HAS unitFormula;
modelAnnotation    : MODEL NAME? annotationBody;
annotationBody     : annotationItem string (',' NEWLINE? string)*;
annotationItem     : NAME #annotationName
                   | NAME '.' annotationItem #annotationSubItem
                   ;
string             : STRING | LONG_STRING;

unitDeclaration    : UNIT NAME (ASSIGNMENT unitFormula)?;
// TODO: merge with normal formula? but i think having it separate is more clear.
unitFormula        : '(' unitFormula ')' #unitGroup
                   | NUMBER unit=NAME? #unitNumber
                   | NAME #unitName
                   | string #unitName
                   | '+' unitFormula #unitPositive
                   | '-' unitFormula #unitNegative
                   // | 'exp' unitFormula #exp // does not seem to actually be valid, but it was in the old grammars
                   | <assoc=right> unitFormula '^' unitFormula #unitPower
                   | unitFormula op=('*' | '/' | '%') unitFormula #unitProduct
                   | unitFormula op=('+' | '-') unitFormula #unitSum
                   ;

// The syntax is the same as reactionNamel, but the "in <compartment>" part doesn't have any semantic meaning
// as far as I can tell. Still compiles, however.
modelCall : reactionName NAME exportList;
