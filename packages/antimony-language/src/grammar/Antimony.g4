grammar Antimony;
import AntimonyLexer;

root : topLevelStatement? (statementSeparator topLevelStatement?)*;
statementSeparator : ';' | NEWLINE;
topLevelStatement : model | statement;

statementList : (statement? statementSeparator)+;
statement : reaction
          | assignment
          | modelCall
          ;
//           | event
//           ;

// e.g
// model Test(A, B)
//    
// end
model : MODEL '*'? NAME exportList? statementList END;
exportList : '(' (variable (',' variable)* )? ')';

// e.g "J1 in compartment1: 2 A + 4 B -> C; k1*20"
reaction        : reactionName? reactionFormula ';' formula? inCompartment?;
reactionName    : NAME inCompartment? ':';
reactionFormula : left=reactantList? ARROW right=reactantList
                | left=reactantList ARROW right=reactantList?
                ;
reactantList : reactant ('+' reactant)*;
reactant : NUMBER? variable;

inCompartment : IN variable;

assignment : variable inCompartment? apostrophe='\''? op=ASSIGNMENT formula;

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

// event           : AT formula ':' NEWLINE* eventAssignment (',' eventAssignment)*;
// eventAssignment : variable '=' formula;

// The syntax is the same as reactionNamel, but the "in <compartment>" part doesn't have any semantic meaning
// as far as I can tell. Still compiles, however.
modelCall : reactionName NAME exportList;
