export interface Node {
  id: string;
}

export interface Account extends Node {
  id: string;
  name: string;
  email: string;
}

export interface Product extends Node {
  id: string;
  name: string;
  description: string;
  owner: Account;
}

export interface BinaryQueryOperatorInput {
  eq?: string;
  ne?: string;
  in?: string[];
  nin?: string[];
}

export interface StringQueryOperatorInput {
  eq?: string;
  ne?: string;
  in?: string[];
  nin?: string[];
  startsWith?: string;
  contains?: string;
}

export interface ProductsFilter {
  id?: BinaryQueryOperatorInput;
  name?: StringQueryOperatorInput;
}

export enum SortOrder {
  ASC = 1,
  DESC = -1,
}

export interface Binary {
  toString(): string;
}

export interface PageInfo {
  hasNextPage: boolean;
  endCursor?: Binary;
}

export interface ProductEdge {
  cursor: Binary;
  node: Product;
}

export interface ProductConnection {
  edges: ProductEdge[];
  pageInfo: PageInfo;
}

export interface CreateProductInput {
  name: string;
  description: string;
}

export interface DeleteProductInput {
  id: string;
}

export interface ProductSortInput {
  [key: string]: SortOrder;
}
