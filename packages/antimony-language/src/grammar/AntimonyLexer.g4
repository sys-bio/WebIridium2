lexer grammar AntimonyTokens;

MODEL : 'model' | 'module';
END   : 'end';
IN    : 'in';

NAME            : [a-zA-Z_]([a-zA-Z0-9_])*;

NUMBER          : [0-9]+ NUMBER_FRACTION? NUMBER_EXPONENT?;
// It is allowed to just put something like '10.'
NUMBER_FRACTION : '.' [0-9]*;
NUMBER_EXPONENT : ('e' | 'E') [0-9]+;

ARROW       : '->' | '=>';
// These are pretty much arrows, but they also have some different semantics (not sure what exactly)
// See this: https://tellurium.readthedocs.io/en/latest/antimony.html#interactions
INTERACTION : '-|' | '-o' | '-(';
DASHES : '--';
COMPARE : '>=' | '<=' | '>' | '<' | '==';
LOGICAL : '&&' | '||';

NEWLINE      : [\n\r];
WHITESPACE   : [ \t\r\u000C] -> channel(HIDDEN);
COMMENT      : '/*' .*? '*/' -> channel(HIDDEN);
LINE_COMMENT : '//' ~[\r\n]* -> channel(HIDDEN);
