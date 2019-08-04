export interface NodeMatch{
    tagName:string,
    attrs: Array<RegExpMatchArray>,
    start:number,
    end:number,
    unarySlash?:string;
}

export interface NodeAstInfo{
    tag:string;
    lowerCasedTag:string;
    attrs:Array<RegExpMatchArray>,
    start:number
    end:number
}