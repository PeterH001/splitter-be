import { Vertex } from "."


export type Edge = {
    source: Vertex,
    drain: Vertex,
    amount: number
}