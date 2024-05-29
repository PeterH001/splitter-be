import { Vertex } from 'src/types';
import { Edge as Input_edge } from 'src/types';

export class Node {
  name: {
    id: number;
    username: string;
  };
  level: number;
  visited: boolean;
  neighbors: Node[];

  constructor(name: Vertex) {
    this.name = name;
    this.neighbors = [];
    this.level = -1;
    this.visited = null;
  }
}

export class Edge {
  source: Node;
  drain: Node;
  amount: number;

  //static factory methods
  public static fromInputEdge(edge: Input_edge): Edge {
    const newEdge = new Edge();
    newEdge.source = new Node(edge.source);
    newEdge.drain = new Node(edge.drain);
    newEdge.amount = edge.amount;

    return newEdge;
  }

  //static factory methods
  public static fromAttributes(
    source: Node,
    drain: Node,
    amount: number,
  ): Edge {
    const newEdge = new Edge();
    newEdge.source = source;
    newEdge.drain = drain;
    newEdge.amount = amount;

    return newEdge;
  }
}

export class Graph {
  nodes: Node[] = [];
  edges: Edge[] = [];

  constructor(vertices: Vertex[], edges: Input_edge[]) {
    vertices.forEach((vertex) => {
      const newNode = new Node(vertex);

      this.addNode(newNode);
    });

    edges.forEach((edge) => {
      const newEdge = Edge.fromInputEdge(edge);

      this.addEdge(newEdge);
    });
  }

  addNode(node: Node) {
    this.nodes.push(node);
  }

  private addEdge(edge: Edge) {
    this.edges.push(edge);
    let source = this.nodes.find((vertex) => vertex.name === edge.source.name);
    let drain = this.nodes.find((vertex) => vertex.name === edge.drain.name);
    source.neighbors.push(drain);
  }

  public simplify() {
    let tmp_edges = this.edges.map(edge=>({...edge}));

    // tmp lista létrehozva
    while(tmp_edges.length > 0){
      const first_tmp_edge = tmp_edges[0];
      const found_edge = this.edges.find(edge=>
        edge.source.name === first_tmp_edge.source.name && 
        edge.drain.name === first_tmp_edge.drain.name
      )
      if(!!found_edge){        
        this.dinic(found_edge)
      }
      tmp_edges.splice(0, 1);
    }

    return this.edges;
  }

  private dinic(edge: Edge) {

    let max_flow = 0;

    //amíg van út a két pont közt
    while (this.bfs(edge) === true) {
      this.nodes.forEach((node) => (node.visited = false));
      const source = this.nodes.find((node) => edge.source.name === node.name);
      while (!source.visited) {
        max_flow += this.dfs(edge);
      }
    }

    //Új él beszúrása a forrás és a cél csomópont közé, maximális folyam kapacitással
    const newEdge = Edge.fromAttributes(edge.source, edge.drain, max_flow);
    this.edges.push(newEdge);
    const source = this.nodes.find(node=> node.name === edge.source.name);
    if(!!source){
      const drain = this.nodes.find(node=> node.name === edge.drain.name);
      source.neighbors.push(drain);
    }else{
      throw new Error('nem találtam a nodeot');
    }
  }

  private bfs(edge: Edge) {
    let has_route: boolean = true;

    //minden node -1-re állítása, visited falsera állítása
    this.nodes.forEach((node) => {
      node.level = -1;
      node.visited = false;
    });

    //source leveljét 0-ra állítom
    let source: Node = this.nodes.find((node) => {
      return edge.source.name === node.name;
    });
    source.level = 0;

    let tmp_list = [{ ...source }];
    while (tmp_list.length > 0) {
      //kiolvassuk az első elemét (tmp_node)
      const tmp_node = tmp_list[0];

      //ha a tmp_csomópont nem látogatott, akkor minden szomszédját beszúrjuk a tmp_lista végére,
      //és mindegyikhez az aktuális szintnél eggyel nagyobbat rendelünk (fontos, hogy nem a gráf csomópontjaihoz rendelünk szinten, hanem csak a listánkban szereplő csomópontokhoz).
      if (!tmp_node.visited) {
        tmp_node.neighbors.forEach((neighbor_node) => {
          let tmp_neighbor = { ...neighbor_node };
          tmp_neighbor.level = tmp_node.level + 1;
          tmp_list.push(tmp_neighbor);
        });
      }

      //végigmegyünk a gráf csomópontjain, keressük a tmp_csomópontot
      const real_node_counterpart = this.nodes.find(
        (node) => tmp_node.name === node.name,
      );
      if (!!real_node_counterpart) {
        //ha megvan, és a szintje -1: átállítjuk azt a tmp_csomópont szintjére
        if (real_node_counterpart.level === -1) {
          real_node_counterpart.level = tmp_node.level;
        }
        //ha megvan, és a szintje nem -1: átállítjuk a látogatottságát igazra
        else {
          real_node_counterpart.visited = true;
        }
      }
      //töröljük a tmp_lista első elemét (tmp_csomópont)
      tmp_list.splice(0, 1);
    }

    let drain = this.nodes.find((node) => edge.drain.name === node.name);
    if (!!drain && drain.level === -1) {
      has_route = false;
    }
    return has_route;
  }

  private dfs(edge: Edge) {
    let current_flow: number = 0;
    let source: Node = edge.source;
    let current_node = this.nodes.find((node) => node.name === source.name);
    //a célhoz vezető edgek listája
    let route_list: Edge[] = [];
    let goal_reached: boolean = false;
    let stop: boolean = false;
    let stop2: boolean = true;

    while (!stop) {
      if (!!current_node) {
        stop2 = true; 
          for(let neighbor_node of current_node.neighbors){
          if (
            neighbor_node.level === current_node.level+1 &&
            // neighbor_node.level > current_node.level &&
            !neighbor_node.visited
          ) {
            //stop2 értékét hamisra állítjuk.
            stop2 = false;
            
            const current_edge = this.edges.find(
              (edge) =>
                edge.source.name === current_node.name &&
                edge.drain.name === neighbor_node.name,
            );
            if (!!current_edge) {
              route_list.push(current_edge);
            } else {
              throw new Error(
                `nincs olyan edge, amelynek a current node a sourcea és a neighbor a drainje. edge.source.name: ${edge.source.name.username}, edge.drain.name: ${edge.drain.name.username}, current_node.name ${current_node.name.username}, neighbor_node.name:  ${neighbor_node.name.username} `,
              );
            }

            //az aktuális csomópontot annak szomszédjára állítjuk
            current_node = neighbor_node;

            if (current_node.name === edge.drain.name) {
              goal_reached = true;
              current_flow = this.update_graph(route_list);
              return current_flow;
            }
          }
          if (goal_reached) {
           break;
          }
        };

        if (stop2) {
          stop = true;
          current_node.visited = true;
        }
      }  
    }
    return current_flow;
  }

  update_graph(route_list: Edge[]): number {
    //tmp_útvonal lista létrehozása, az útvonal tartalmának átmásolása a tmp_útvonal listába
    let tmp_route = route_list.map(edge=>({...edge}));
    //aktuális folyam értékének 0-ra állítása
    let current_flow = 0;
  
      //a gráf élein Loop
      tmp_route.forEach((edge) => {
        //ha az aktuális folyam értéke 0 vagy nagyobb, mint az él kapacitása, akkor
        if (current_flow === 0 || current_flow > edge.amount) {
          //aktuális folyam értékének az él kapacitásának értékére állítása
          current_flow = edge.amount;
        }
      });
  
    let updated_route = route_list.map(edge=>({...edge}));
    //edge lista frissítése, ha kell, edge törlése
    updated_route.forEach(edge=>{
      //az él kapacitásának csökkentése az aktuális folyammal
      edge.amount -= current_flow;

      const index = this.edges.findIndex(edge_in_edges=>
        edge_in_edges.source.name === edge.source.name && 
        edge_in_edges.drain.name === edge.drain.name
      )
      if(index !== -1){
        //ha az él kapacitása 0, az él törlése
        if(edge.amount === 0){
          this.edges.splice(index, 1);
          let source = this.nodes.find(node=>edge.source.name === node.name);
          const index2 = source.neighbors.findIndex(neighbor=>neighbor.name === edge.drain.name);
          if(index2 !== -1){
            source.neighbors.splice(index2, 1);
          }
        }else{
          this.edges[index].amount -= current_flow;
        }
      }
    })
  
    return current_flow;
  }
}
