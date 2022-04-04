import * as fs from 'fs'
import { Module, Statement, Token, Node, Identifier, Expression, Table, Error } from './types'
import { lexAll } from './lex'
import { compile } from './compile'

const args = process.argv.slice(2)
const write = args.includes("--write")
const tests = args.indexOf("--tests") > -1 ? args[args.indexOf("--tests") + 1] : undefined

const strong = (str: string) => console.log('\x1b[1m%s\x1b[0m', str);

function test(kind: string, name: string, value: unknown) {
    const reference = `baselines/reference/${name}.${kind}.baseline`
    const local = `baselines/local/${name}.${kind}.baseline`
    const actual = typeof value === "string" ? value : JSON.stringify(value, undefined, 2)
    const expected = fs.existsSync(reference) ? fs.readFileSync(reference, "utf8") : ""
    if (actual !== expected) {
        if (!fs.existsSync("./baselines/local")) fs.mkdirSync("./baselines/local")
        fs.writeFileSync(local, actual)

        strong(`${name} failed: Expected baselines to match`)
        if (actual && expected) {
            console.log(` - result   - ${local}`)
            console.log(` - expected - ${reference}`)
            console.log(` - run: diff ${local} ${reference}`)
        } else if (actual && !expected) {
            console.log(` - result   - ${local}`)
            console.log(` - missing  - ${reference}`)
            if (!write) {
                console.log(` - run with '--write' to update the baselines`)
            } else {
                console.log(` - updated baselines`)
                fs.writeFileSync(reference, actual)
            }
        }
        console.log(``)
        return 1
    }
    return 0
}

function sum(ns: number[]) {
    let total = 0
    for (const n of ns) total += n
    return total
}
const lexTests = {
    "basicLex": "x",
    "firstLex": " 1200Hello    World1! 14d",
    "underscoreLex": "x_y is _aSingle Identifier_",
    "varLex": "var x = 1",
    "semicolonLex": "x; y",
    "newlineLex": "x\n y  \n" ,
}
let lexResult = sum(Object.entries(lexTests).map(
    ([name, text]) => test("lex", name, lexAll(text).map(t => t.text ? [Token[t.token], t.text] : [Token[t.token]]))))
let compileResult = sum(fs.readdirSync("tests").map(file => {
    if (!tests || file.startsWith(tests)) {
        const content = fs.readFileSync("tests/" + file, 'utf8')
        const [tree, errors, js] = compile(content)
        const name = file.slice(0, file.length - 3)
        return test("tree", name, displayModule(tree))
            + test("errors", name, displayErrors(errors, content))
            + test("js", name, js)
    }
    return 0
}))
function displayModule(m: Module) {
    return { locals: displayTable(m.locals), statements: m.statements.map(display) }
}
function displayTable(table: Table) {
    const o = {} as any
    for (const [k,v] of table) {
        o[k] = v.declarations.map(({ kind, pos }) => ({ kind: Node[kind], pos }))
    }
    return o
}
function displayErrors(errors: Error[], content: string) {
    if (!errors.length) return '(no errors)'
    errors = errors.slice()
    let linePos = 0
    let pos = 0
    let out = ''
    while (pos < content.length) {
        if (content[pos] === '\r' && content[pos + 1] === '\n' || content[pos] === '\n') {
            pos += content[pos] === '\r' ? 2 : 1
            out += content.slice(linePos, pos)
            for (const error of errors) {
                if (error.pos < linePos || error.pos > pos) break;
                out += ' '.repeat(error.pos - linePos) + '^ ' + error.message + '\n'
                errors.shift()
            }
            linePos = pos
        }
        else {
            pos++
        }
    }
    return out
}
function display(o: any) {
    const o2 = {} as any
    for (const k in o) {
        if (k === 'pos') continue
        else if (k === 'kind') o2[k] = Node[o.kind]
        else if (typeof o[k] === 'object') o2[k] = display(o[k])
        else o2[k] = o[k]
    }
    return o2
}

let result = lexResult + compileResult
if (result === 0) {
    strong("All tests passed")
}
else {
    console.log(result, "tests failed.")
}
console.log("")
process.exit(result)
