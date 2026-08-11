lexer grammar AntimonyTokens;

MODEL     : 'model' | 'module';
END       : 'end';
IN        : 'in';
AT        : 'at';
AFTER     : 'after';
UNIT      : 'unit';
HAS       : 'has';
SUBS_ONLY : 'substanceOnly';

CONST_MODIFIER : 'var' | 'const';
DECL_WORD      : 'species'
               | 'formula'
               | 'compartment'
               | 'gene'
               | 'dna'
               | 'operator'
               | 'reaction'
               ;

NAME : [a-zA-Z_]([a-zA-Z0-9_])*;

NUMBER                   : '-'? [0-9]+ NUMBER_FRACTION? NUMBER_EXPONENT?
                         | NUMBER_FRACTION NUMBER_EXPONENT?
                         ;
// It is allowed to just put something like '10.'
fragment NUMBER_FRACTION : '.' [0-9]*;
fragment NUMBER_EXPONENT : ('e' | 'E') ('-' | '+')? [0-9]+;

ARROW       : '->' | '=>';

// These are pretty much arrows, but they also have some different semantics (not sure what exactly)
// See this: https://tellurium.readthedocs.io/en/latest/antimony.html#interactions
INTERACTION : '-|' | '-o'; // | '-(' this last one doesn't work because it can get confused by -(a + b) where -( will be seen as its own token
DASHES      : '--';
COMPARE     : '>=' | '<=' | '>' | '<' | '==' | '!=';
LOGICAL     : '&&' | '||';

STRING                   : '"' (~["\\\r\n] | ESCAPE_SEQUENCE)* '"';
fragment ESCAPE_SEQUENCE : '\\' .;

// It is "+" because that is how it is in the original grammar (you can't have an empty one)
// `` is special case for empty striing. ```` does not work.
// Also, notably, LONG_STRING does not support escapes of any form.
LONG_STRING : ('```' .+? '```') | '``';

NEWLINE      : [\n\r];
WHITESPACE   : [ \t\r\u000C] -> channel(HIDDEN);
COMMENT      : '/*' .*? '*/' -> channel(HIDDEN);
LINE_COMMENT : ('//' ~[\r\n]* | '#' ~[\r\n]*) -> channel(HIDDEN);
