grammar Antimony;
import AntimonyLexer;

root : topLevelStatement? (statementSeparator topLevelStatement?)* EOF;
statementSeparator : ';' | NEWLINE;
topLevelStatement : model | functionDefinition | statement;

statementList : (statement? statementSeparator)+;
statement : reaction
          | assignment
          | declaration
          | modelImport
          | event
          | annotation
          | unitDeclaration
          | inStatement
          | rename
          | delete
          ;

// e.g
// model Test(A, B)
//    
// end
model : MODEL star='*'? NAME exportList? statementList END;
exportList : '(' (variable (',' variable)* )? ')';

functionDefinition : FUNCTION NAME parameterList statementSeparator* formula statementSeparator* END;
parameterList : '(' (NAME (',' NAME)*)? ')';

formula : '(' formula ')' #group
        | NUMBER #number
        | functionCall #call
        | variable #var
        // | 'exp' formula #exp // does not seem to actually be valid, but it was in the old grammars
        | <assoc=right> formula '^' formula #power
        | '+' formula #positive
        | '-' formula #negative
        | '!' formula #not
        | formula op=('*' | '/' | '%') formula #product
        | formula op=('+' | '-') formula #sum
        | formula op=COMPARE formula #compare
        // In the Antimony grammar, || and && these are the same precedence
        // Also they are individual tokens (you can put a space between)...
        // but not going to bother with that right now.
        | formula op=LOGICAL formula #logical
        ;

functionCall : NAME '(' argumentList? ')';
argumentList : formula (',' formula)*;

variable : NAME #name
         | variable '.' NAME #subvariable
         | '$' variable #constant
         ;

inCompartment : IN variable;
nameLabel     : NAME inCompartment? ':';

// e.g "J1 in compartment1: 2 A + 4 B -> C; k1*20"
reaction        : nameLabel? reactionFormula ';' formula? inCompartment?;
reactionFormula : left=reactantList? ARROW right=reactantList?;
reactantList : reactant ('+' reactant)*;
reactant : stoichiometry? variable;
stoichiometry : '-'? NUMBER
              | variable;

assignment : variable inCompartment? mod=('\'' | ':')? '=' formula?;

declaration     : declarationHead declarationTerm (',' declarationTerm)*;
declarationHead : CONST_MODIFIER SUBS_ONLY? DECL_WORD
                | CONST_MODIFIER SUBS_ONLY? 
                | SUBS_ONLY? DECL_WORD
                | SUBS_ONLY
                ;
declarationTerm : assignment #declarationAssignment
                | variable inCompartment? #declarationName
                ;

event            : nameLabel? AT trigger=formula eventOptions? ':' eventAssignments?
                 | nameLabel? AT delay=formula AFTER trigger=formula eventOptions? ':' eventAssignments?
                 ;
eventOptions     : (',' eventOption)+;
eventOption      : NAME '=' formula;
eventAssignments : NEWLINE* eventAssignment (',' NEWLINE* eventAssignment)*;
eventAssignment  : variable '=' formula;

rename : variable IS variable;

delete : DELETE variable;

annotation         : variableAnnotation | hasAnnotation | modelAnnotation;
variableAnnotation : variable annotationBody;
hasAnnotation      : variable HAS unitFormula;
modelAnnotation    : MODEL NAME? annotationBody;
annotationBody     : annotationItem string (',' NEWLINE? string)*;
annotationItem     : IS #annotationIs
                   | NAME #annotationName
                   | NAME '.' annotationItem #annotationSubItem
                   ;
string             : STRING | LONG_STRING;

unitDeclaration    : UNIT NAME ('=' unitFormula)?;
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

inStatement : variable inCompartment;

modelImport : nameLabel? NAME exportList;
