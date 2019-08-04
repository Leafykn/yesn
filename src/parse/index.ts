import {makeMap} from '../utils/index.js';
import { NodeMatch, NodeAstInfo } from './index.inteface.js';

const isNonPhrasingTag = makeMap(
    'address,article,aside,base,blockquote,body,caption,col,colgroup,dd,' +
    'details,dialog,div,dl,dt,fieldset,figcaption,figure,footer,form,' +
    'h1,h2,h3,h4,h5,h6,head,header,hgroup,hr,html,legend,li,menuitem,meta,' +
    'optgroup,option,param,rp,rt,source,style,summary,tbody,td,tfoot,th,thead,' +
    'title,tr,track'
);

const isUnaryTag = makeMap(
    'area,base,br,col,embed,frame,hr,img,input,isindex,keygen,' +
    'link,meta,param,source,track,wbr'
)

const canBeLeftOpenTag = makeMap(
    'colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr,source'
)

const isIgnoreNewlineTag = makeMap('pre,textarea', true)
const shouldIgnoreFirstNewline = (tag:string, html:string) => tag && isIgnoreNewlineTag(tag) && html[0] === '\n'

const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`
const qnameCapture = `((?:${ncname}\\:)?${ncname})`
const startTagOpen = new RegExp(`^<${qnameCapture}`)
const startTagClose = /^\s*(\/?)>/
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)
const comment = /^<!\--/
const isPlainTextElement = makeMap('script,style,textarea', true);

exports.parseHTML = function(html:string,options:any){
    const stack:Array<NodeAstInfo> = [];
    const expectHTML = options.expectHTML;
    let index = 0;
    let last:string = '' ;
    let lastTag:string = '';
    let els:Array<NodeAstInfo> = [];
    while(html){
        last = html;
        //确定解析的dom元素不砸死script,style标签内
        if(!lastTag || !isPlainTextElement(lastTag)){
            let textEnd = html.indexOf('<');
            if(textEnd === 0){
                //忽略注释部分
                if(comment.test(html)){
                    const commenEnd = html.indexOf('-->');
                    if(commenEnd >=0){
                        advance(commenEnd+3);
                        continue;
                    }
                }
                //匹配是否是结尾标签
                const endTagMatch = html.match(endTag);
                if(endTagMatch){
                    const curIndex = index;
                    advance(endTagMatch[0].length);
                    parseEndTag(endTagMatch[1],curIndex,index);
                    continue;
                }
                //匹配是否是开始标签
                const startTagMatch = parseStartTag()
                if(startTagMatch){
                    handleStartTag(startTagMatch);
                    if(shouldIgnoreFirstNewline(startTagMatch.tagName,html))
                        advance(1);
                    continue;
                }
            }

            let text,rest,next;
            if(textEnd>= 0){
                rest = html.slice(textEnd);
                //截取非标签信息
                while(
                    !endTag.test(rest)&&
                    !startTagOpen.test(rest)&&
                    !comment.test(rest)
                ){
                    next = rest.indexOf('<');
                    if(next<0)
                        break;
                    textEnd += next;
                    rest = html.slice(textEnd);
                }
                text = html.substring(0,textEnd);
            }

            if(textEnd<0)
                text = html;
            
            if(text)
                advance(text.length);
            
        }else{
            throw new Error('can not resovle '+lastTag);
        }
        if(html === last)
            break;
    }
    return els;

    function parseStartTag(){
        const start = html.match(startTagOpen);
        if(start){
            const match:NodeMatch = {
                tagName:start[1],
                attrs: [],
                start:index,
                end:-1,
            }
            advance(start[0].length)
            let end , attr;
            while(!(end = html.match(startTagClose)) && (attr = html.match(attribute))){
                advance(attr[0].length);
                match.attrs.push(attr);
            }
            if(end){
                match.unarySlash = end[1];
                advance(end[0].length)
                match.end = index;
                return match;
            }
        }
    }


    function parseEndTag(tagName:string,start?:number,end?:number){
        let pos , lowerCasedTagName;
        if(!start) start = index;
        if(!end) end = index;

        if(tagName){
            lowerCasedTagName = tagName.toLowerCase();
            for(pos = stack.length-1;pos>=0;pos--){
                if(stack[pos].lowerCasedTag === lowerCasedTagName){
                    stack[pos].end = index;
                    break;
                }
            }
        }else{
            pos = 0;
        }

        if(pos >= 0){
            for(let i = stack.length-1;i>=pos;i--){
                
            }
            stack.length = pos;
            lastTag = (pos && stack[pos-1].tag) as string;
        }else if(lowerCasedTagName === 'br'){

        }else if(lowerCasedTagName === 'p'){

        }
    }

    function handleStartTag(match:NodeMatch){
        const tagName = match.tagName;
        const unarySlash = match.unarySlash;

        if(expectHTML){
            if(lastTag === 'p' && isNonPhrasingTag(tagName)){
                parseEndTag(lastTag);
            }
            if(canBeLeftOpenTag(tagName)&&lastTag === tagName){
                parseEndTag(tagName);
            }
        }
        
        const l = match.attrs.length;
        const attrs = new Array(l);
        for(let i = 0;i<l;i++){
            const args = match.attrs[i];
            const value = args[3] || args[4] || args[5] || '';
            attrs[i] = {
                name:args[1],
                value
            };
        }

        const unary = isUnaryTag(tagName) || !!unarySlash;
        if(!unary){
            const info = {tag:tagName,lowerCasedTag:tagName.toLowerCase(),attrs,start:match.start,end:match.end}
            stack.push(info);
            els.push(info);
            lastTag = tagName;
        }
    }

    //切割出新的html
    function advance(n:number){
        index += n;
        html = html.substring(n);
    }
}