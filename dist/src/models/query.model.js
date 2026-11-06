"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryResponse = exports.DEFAULT_LIMIT = exports.DEFAULT_PAGE = void 0;
exports.DEFAULT_PAGE = 1;
exports.DEFAULT_LIMIT = 20;
class QueryResponse {
    data;
    pagination;
    links;
    constructor(data, totalNumberOfItems, baseUrl, page, limit) {
        if (limit === undefined) {
            limit = exports.DEFAULT_LIMIT;
        }
        if (page === undefined) {
            page = exports.DEFAULT_PAGE;
        }
        this.data = data;
        this.pagination = {
            totalItems: totalNumberOfItems,
            totalPages: Math.ceil(totalNumberOfItems / limit),
            currentPage: page,
        };
        this.links = {
            self: `${baseUrl}?page=${page}&limit=${limit}`,
            first: `${baseUrl}?page=${1}&limit=${limit}`,
            prev: (page == 1) ? null : `${baseUrl}?page=${page - 1}&limit=${limit}`,
            next: (page >= this.pagination.totalItems) ? null : `${baseUrl}?page=${page + 1}&limit=${limit}`,
            last: `${baseUrl}?page=${this.pagination.totalPages}&limit=${limit}`,
        };
    }
}
exports.QueryResponse = QueryResponse;
