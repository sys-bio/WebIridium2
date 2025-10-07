grammar Antimony;
import AntimonyLexer;

root : (topLevelStatement (statementSeparator topLevelStatement)*)?;
statementSeparator : (';' | NEWLINE)*;
topLevelStatement : model | statement;

statementList : (statement (statementSeparator statement)*)?;
statement : reaction;

model : MODEL '*'? NAME exportList? statementList END;
exportList : '(' (variable (',' variable)* )? ')';

// e.g
// model Test(A, B)
//    
// end
model : MODEL '*'? NAME exportList? statementList END;
exportList : '(' (variable (',' variable)* )? ')';

// e.g "J1 in compartment1: 2 A + 4 B -> C; k1*20"
reaction        : reactionName? reactionFormula ';' formula? compartmentSpecifier?;
reactionName    : NAME compartmentSpecifier? ':';
reactionFormula : reactantList? ARROW reactantList
    | reactantList ARROW reactantList?
    ;
reactantList : reactant ('+' reactant)*;
reactant : NUMBER? variable;
compartmentSpecifier : IN NAME;

assignment : NAME '=' formula;

formula : formula ('+' | '-') formula #sum
    | formula ('*' | '/') formula #product
    | formula '^' #power
    // | 'exp' formula #exp // does not seem to actually be valid, but it was in the old grammars
    | '(' formula ')' #group
    | formula LOGICAL formula #logical
    | formula COMPARE formula #compare
    | variable #var
    | '-' NUMBER #negative
    | '+' NUMBER #positive
    | NUMBER #number
    | functionCall #call
    ;

functionCall : NAME '(' parameterList? ')';
parameterList : formula (',' formula)*;

variable : NAME
    | variable '.' NAME
    | '$' variable
    ;
