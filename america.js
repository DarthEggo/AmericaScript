//"Borrowed" from https://lisperator.net/, with edits made to make it peak 'Murica
//To be clear, I didn't just copy/paste and changed keywords, I used a base framework and added features from there. I added While Loops, strong declaration, and +=/-=/*=//= operators

//Input Stream
function InputStream(input) {
    var pos = 0, line = 1, col = 0;
    return {
        next  : next,
        peek  : peek,
        eof   : eof,
        throwErr : throwErr,
    };
    function next() {
        var ch = input.charAt(pos++);
        if (ch == "\n") line++, col = 0; else col++;
        return ch;
    }
    function peek() {
        return input.charAt(pos);
    }      
    function eof() {
        return peek() == "";
    }
    function throwErr(msg) {
      throw new Error("Uncle Sam has come to tell you something in your code has upset the Compiler CIA: " + msg + " (" + line + ":" + col + ")");
    }
}

//Token Stream
function TokenStream(input) {
    var current = null;
    var keywords = " if then else burger true false declare stars return ";
    return {
        next  : next,
        peek  : peek,
        eof   : eof,
        throwErr : input.throwErr
    };
    function is_keyword(x) {
        return keywords.indexOf(" " + x + " ") >= 0;
    }
    function is_digit(ch) {
        return /[0-9]/i.test(ch);
    }
    function is_id_start(ch) {
        return /[a-zλ_]/i.test(ch);
    }
    function is_id(ch) {
        return is_id_start(ch) || "?!-<>=0123456789".indexOf(ch) >= 0;
    }
    function is_op_char(ch) {
        return "+-*/%=&|<>!+=-=*=/=".indexOf(ch) >= 0;
    }
    function is_punc(ch) {
        return ",;(){}[]".indexOf(ch) >= 0;
    }
    function is_whitespace(ch) {
        return " \t\n".indexOf(ch) >= 0;
    }
    function read_while(predicate) {
        var str = "";
        while (!input.eof() && predicate(input.peek()))
            str += input.next();
        return str;
    }
    function read_number() {
        var has_dot = false;
        var number = read_while(function(ch){
            if (ch == ".") {
                if (has_dot) return false;
                has_dot = true;
                return true;
            }
            return is_digit(ch);
        });
        return { type: "num", value: parseFloat(number) };
    }
    function read_ident() {
        var id = read_while(is_id);
        return {
            type  : is_keyword(id) ? "kw" : "var",
            value : id,
						declared: is_keyword(id) ? null : false,
        };
    }
    function read_escaped(end) {
        var escaped = false, str = "";
        input.next();
        while (!input.eof()) {
            var ch = input.next();
            if (escaped) {
                str += ch;
                escaped = false;
            } else if (ch == "\\") {
                escaped = true;
            } else if (ch == end) {
                break;
            } else {
                str += ch;
            }
        }
        return str;
    }
    function read_string() {
        return { type: "str", value: read_escaped('"') };
    }
    function skip_comment() {
        read_while(function(ch){ return ch != "\n" });
        input.next();
    }
    function read_next() {
        read_while(is_whitespace);
        if (input.eof()) return null;
        var ch = input.peek();
        if (ch == "@") {
            skip_comment();
            return read_next();
        }
        if (ch == '"') return read_string();
        if (is_digit(ch)) return read_number();
        if (is_id_start(ch)) return read_ident();
        if (is_punc(ch)) return {
            type  : "punc",
            value : input.next()
        };
        if (is_op_char(ch)) return {
            type  : "op",
            value : read_while(is_op_char)
        };
        input.throwErr("Can't handle character: " + ch);
    }
    function peek() {
        return current || (current = read_next());
    }
    function next() {
        var tok = current;
        current = null;
        return tok || read_next();
    }
    function eof() {
        return peek() == null;
    }
}

//Parser
var FALSE = {type: "bool", value: false};
function parse(input) {
		var assign = null;
    var PRECEDENCE = {
        "=": 1,
        "||": 2,
        "&&": 3,
        "<": 7, ">": 7, "<=": 7, ">=": 7, "==": 7, "!=": 7,
        "+": 10, "-": 10,
        "*": 20, "/": 20, "%": 20,
				"+=": 30, "-=": 30, "*=": 30, "/=": 30,
    };
    return parse_toplevel();
    function is_punc(ch) {
        var tok = input.peek();
        return tok && tok.type == "punc" && (!ch || tok.value == ch) && tok;
    }
    function is_kw(kw) {
        var tok = input.peek();
        return tok && tok.type == "kw" && (!kw || tok.value == kw) && tok;
    }
    function is_op(op) {
        var tok = input.peek();
        return tok && tok.type == "op" && (!op || tok.value == op) && tok;
    }
    function skip_punc(ch) {
        if (is_punc(ch)) input.next();
        else input.throwErr("Expecting punctuation: \"" + ch + "\"");
    }
    function skip_kw(kw) {
        if (is_kw(kw)) input.next();
        else input.throwErr("Expecting keyword: \"" + kw + "\"");
    }
    function skip_op(op) {
        if (is_op(op)) input.next();
        else input.throwErr("Expecting operator: \"" + op + "\"");
    }
    function unexpected() {
        input.throwErr("Unexpected token: " + JSON.stringify(input.peek()));
    }
    function maybe_binary(left, my_prec) {
        var tok = is_op();
        if (tok) {
            var his_prec = PRECEDENCE[tok.value];
            if (his_prec > my_prec) {
                input.next();
                return maybe_binary({
                    type     : tok.value == "=" ? "assign" : "binary",
                    operator : tok.value,
                    left     : tok.value == "=" ? assign : left,
                    right    : maybe_binary(parse_atom(), his_prec)
                }, my_prec);
            }
        }
        return left;
    }
    function delimited(start, stop, separator, parser) {
        var a = [], first = true;
        skip_punc(start);
        while (!input.eof()) {
            if (is_punc(stop)) break;
            if (first) first = false; else skip_punc(separator);
            if (is_punc(stop)) break;
            a.push(parser());
        }
        skip_punc(stop);
        return a;
    }
    function parse_call(func) {
        return {
            type: "call",
            func: func,
            args: delimited("(", ")", ",", parse_expression),
        };
    }
    function parse_varname() {
        var name = input.next(); 
        if (name.type != "var") input.throwErr("Expecting variable name");
        return name.value;
    }
    function parse_if() {
        skip_kw("if");
        var cond = parse_expression();
        if (!is_punc("{")) skip_kw("then");
        var then = parse_expression();
        var ret = {
            type: "if",
            cond: cond,
            then: then,
        };
        if (is_kw("else")) {
            input.next();
            ret.else = parse_expression();
        }
        return ret;
    }
    function parse_burger() {
        return {
            type: "burger",
            vars: delimited("(", ")", ",", parse_varname),
            body: parse_expression()
        };
    }
	function parse_declare() {
		var v = input.next();
		v.declared = true;
		assign = v;
		return {
			type: "declare",
		}
	}
	function parse_stars() {	
		return {
			type: "stars",
			cond: parse_expression(),
			exec: parse_expression(),
		}
	}
	function parse_return() {
		  return {
				type: "return",
				value: delimited("(",")","&", parse_returnvalue)
			}
	}
	function parse_returnvalue() {
		//skip_punc(start);
		var tok = input.next();
    if (tok.type == "var" || tok.type == "num" || tok.type == "str") {
			//skip_punc(")");
      return tok;
		}
		else {
			throw new Error("Uncle Sam has come to tell you something in your code has upset the Compiler CIA: Un returnable value. It must be a var, a num, or a string. If you are trying to return a function, please assign it to a variable then return the variable");
		}
	}
		 
    function parse_bool() {
        return {
            type  : "bool",
            value : input.next().value == "true"
        };
    }
    function maybe_call(expr) {
        expr = expr();
        return is_punc("(") ? parse_call(expr) : expr;
    }
    function parse_atom() {
        return maybe_call(function(){
            if (is_punc("(")) {
                input.next();
                var exp = parse_expression();
                skip_punc(")");
                return exp;
            }
            if (is_punc("{")) return parse_prog();
            if (is_kw("if")) return parse_if();
            if (is_kw("true") || is_kw("false")) return parse_bool();
            if (is_kw("burger")) {
                input.next();
                return parse_burger();
            }
						if (is_kw("declare")) {
							input.next();
							return parse_declare();
						}
						if(is_kw("stars")) {
							input.next();
							return parse_stars();
						}
						if(is_kw("return")) {
							input.next();
							return parse_return();
						}
            var tok = input.next();
            if (tok.type == "var" || tok.type == "num" || tok.type == "str")
                return tok;

            unexpected();
        });
    }
    function parse_toplevel() {
        var prog = [];
        while (!input.eof()) {
            prog.push(parse_expression());
            if (!input.eof()) skip_punc(";");
        }
        return { type: "prog", prog: prog };
    }
    function parse_prog() {
        var prog = delimited("{", "}", ";", parse_expression);
        if (prog.length == 0) return FALSE;
        if (prog.length == 1) return prog[0];
        return { type: "prog", prog: prog };
    }
    function parse_expression() {
        return maybe_call(function(){
            return maybe_binary(parse_atom(), 0);
        });
    }
	
}

//Interpreter
function Environment(parent) {
    this.vars = Object.create(parent ? parent.vars : null);
    this.parent = parent;
}
Environment.prototype = {
    extend: function() {
        return new Environment(this);
    },
    lookup: function(name) {
        var scope = this;
        while (scope) {
            if (Object.prototype.hasOwnProperty.call(scope.vars, name))
                return scope;
            scope = scope.parent;
        }
    },
    get: function(name) {
        if (name in this.vars)
            return this.vars[name];
        		throw new Error("Uncle Sam has come to tell you something in your code has upset the Compiler CIA: " + "Undefined variable " + name);
    },
    set: function(name, value) {
        var scope = this.lookup(name);
        // let's not allow defining globals from a nested environment
        if (!scope && this.parent)
            throw new Error("Uncle Sam has come to tell you something in your code has upset the Compiler CIA: " + "Undefined variable " + name);
        return (scope || this).vars[name] = value;
    },
    def: function(name, value) {
        return this.vars[name] = value;
    }
};

function evaluate(exp, env) {
    switch (exp.type) {
      case "num":
      case "str":
      case "bool":
        return exp.value;
      case "var":
        return env.get(exp.value);
			case "stars":
				var cond = evaluate(exp.cond, env);	
				while(cond) {
					evaluate(exp.exec, env);
					cond = evaluate(exp.cond, env);
				}
				return "stars";
			case "return":
				return exp.value;
			case "declare":
				return "declare";
      case "assign":
        if (exp.left.type != "var")
            throw new Error("Uncle Sam has come to tell you something in your code has upset the Compiler CIA: " + "Cannot assign to " + JSON.stringify(exp.left));
				if(!exp.left.declared) throw new Error("Uncle Sam has come to tell you something in your code has upset the Compiler CIA: Variable not Declared");
        return env.set(exp.left.value, evaluate(exp.right, env));
      case "binary":
					switch(exp.operator) {
						case "+=":
						case "-=":
						case "*=":
						case "/=":
							return apply_op(exp.operator,
          		exp.left,
          		evaluate(exp.right, env), env);
						default:
        			return apply_op(exp.operator,
          		evaluate(exp.left, env),
          		evaluate(exp.right, env), env);
					}
      case "burger":
				return make_burger(env,exp);
      case "if":
        var cond = evaluate(exp.cond, env);
        if (cond !== false) return evaluate(exp.then, env);
        return exp.else ? evaluate(exp.else, env) : false;			
      case "prog":
        var val = false;
        exp.prog.forEach(function(exp){val = evaluate(exp,env)});
        return val;
      case "call":
        var func = evaluate(exp.func, env);
        return func.apply(null, exp.args.map(function(arg){
            return evaluate(arg, env);
        }));			
      default:
        throw new Error("Uncle Sam has come to tell you something in your code has upset the Compiler CIA: " + "I don't know how to evaluate " + exp.type);
    }
}

function apply_op(op, a, b, env) {
    function num(x) {
        if (typeof x != "number")
            throw new Error("Uncle Sam has come to tell you something in your code has upset the Compiler CIA: " + "Expected number but got " + x);
        return x;
    }
    function div(x) {
        if (num(x) == 0)
            throw new Error("Divide by zero. Uncle Sam is not proud.");
        return x;
    }
    switch (op) {
      case "+"  : return num(a) + num(b);
      case "-"  : return num(a) - num(b);
      case "*"  : return num(a) * num(b);
      case "/"  : return num(a) / div(b);
      case "%"  : return num(a) % div(b);
      case "&&" : return a !== false && b;
      case "||" : return a !== false ? a : b;
      case "<"  : return num(a) < num(b);
      case ">"  : return num(a) > num(b);
      case "<=" : return num(a) <= num(b);
      case ">=" : return num(a) >= num(b);
      case "==" : return a === b;
      case "!=" : return a !== b;
			case "+=": 
			case "-=": 
			case "*=": 
			case "/=":  
				return equals(a, b, op, env)
			}
    throw new Error("Uncle Sam has come to tell you something in your code has upset the Compiler CIA: " + "Can't apply operator " + op);
}
function equals(a, b, op, env) {
	function num(x) {
        if (typeof x != "number")
          throw new Error("Uncle Sam has come to tell you something in your code has upset the Compiler CIA: " + "Expected number but got " + x);
        return x;
    }
    function div(x) {
        if (num(x) == 0)
            throw new Error("Divide by zero. Uncle Sam is not proud.");
        return x;
    }
	if(op == "+=") {
		env.vars[a.value] += num(b);
	}
	else if(op == "-=") {
		env.vars[a.value] -= num(b);
	}
	else if(op == "*=") {
		env.vars[a.value] *= num(b);
	}
	else if(op == "/=") {
		env.vars[a.value] /= div(b);
	}
}

function make_burger(env, exp) {
    function burger() {
        var names = exp.vars;
        var scope = env.extend();
        for (var i = 0; i < names.length; ++i)
            scope.def(names[i], i < arguments.length ? arguments[i] : false);
        return evaluate(exp.body, scope);
    }
    return burger;
}

const args = process.argv.slice(2);
var fs = require("fs");

//Get the code and Compile
const code = fs.readFileSync(args[0] + ".murica").toString();
var ast = parse(TokenStream(InputStream(code)));
globalEnv = new Environment();

globalEnv.def("eagle", function(txt){ console.log(txt); });

let time = new Date().getTime();
//Run the Program
evaluate(ast, globalEnv);

let compileTime = new Date().getTime() - time; 
if(args[1] == "time") {
console.log("Compiled in " + compileTime + " ms");
}
