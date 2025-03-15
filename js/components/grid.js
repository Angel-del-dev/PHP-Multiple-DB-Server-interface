import { FetchPromise } from "../lib/utils.js";
import { Alert } from "./alerts.js";

class Grid {
    #columns_info; data; #allow_html_rendering;
    constructor({ columns_info = [] }) {
        this.#columns_info = columns_info;
        this.data = [];
        this.#allow_html_rendering = false;
        this.tablename = null;
        this.MountRoute = null;
        this.Database = null;
        // Infinite scroll
        this.Offset = 0;
        this.ChunkSize = 50;
    }

    AllowHtmlRendering() { this.#allow_html_rendering = true; }

    AddRows(data) { this.data = data; }

    FetchTableDataOnFinished(Database, tablename, mountroute) {
        this.tablename = tablename; 
        this.MountRoute = mountroute;
        this.Database = Database;
    }

    CreateFooter(footer) {
        const input_chunk_size = document.createElement('input');
        input_chunk_size.type = 'text';
        input_chunk_size.placeholder = 'Chunk size';
        input_chunk_size.value = this.ChunkSize;
        input_chunk_size.style.width = '10vmin';

        const self = this;
        input_chunk_size.addEventListener('keydown', e => {
            if(!/^\d+$/.test(e.key)) e.preventDefault();
        });
        input_chunk_size.addEventListener('change', e => {
            if(e.target.value === '') e.target.value = '0';

            self.ChunkSize = parseInt(e.target.value);
            self.Offset = -1;
            self.data = [];
            const table = footer.closest('.full-grid-wrapper').querySelector('table');
            table.querySelector('tbody').innerHTML = '';
            InfiniteScroll(table, self);
        });

        footer.append(input_chunk_size);
    }

    Draw(container_node) {
        this.container_node = container_node;
        this.container_node.classList.add('full-grid-wrapper');
        this.container_node.innerHTML = '';
        const self = this;

        const grid_wrapper = document.createElement('div');
        grid_wrapper.classList.add('grid-wrapper');

        const table = document.createElement('table');
        table.classList.add('grid');
        table.append(create_grid_header(self, this.#columns_info));
        table.append(create_grid_values(this.#columns_info, this.data, { allow_html_rendering: this.#allow_html_rendering }));

        grid_wrapper.append(table);

        grid_wrapper.addEventListener('scroll', e => {
            const element = grid_wrapper;
            const AmountScrolled = Math.abs(element.scrollHeight - element.clientHeight - element.scrollTop);
            if(self.tablename === null) return;
            if(AmountScrolled >= 1) return;
            InfiniteScroll(e.target, self);
        });

        const footer = document.createElement('div');
        footer.classList.add('grid-footer');

        this.CreateFooter(footer);

        this.container_node.append(grid_wrapper, footer);
    }

    ReOrder(index) {
        this.#columns_info.forEach((column, i) => {
            if(i === index) {
                if(column.order === undefined) column.order = 0;
                else column.order = column.order === 0 ? 1 : 0;
            } else {
                delete column.order;
            }
        });

        this.data.sort((a, b) => {
            if(this.#columns_info[index].order === 0) {
                return a[index] > b[index] ? 1 : -1;
            } else {
                return a[index] < b[index] ? 1 : -1;
            }
        });

        this.Draw(this.container_node);
    }
}

const InfiniteScroll = async (target, self) => {
    const { code, message, Data } = await FetchPromise(
        self.MountRoute, 
        { 
            action: 'GETSLICEFROMTABLE', 
            fields: { Database: self.Database, Table: self.tablename, Offset: self.ChunkSize*(++self.Offset), ChunkSize: self.ChunkSize } 
        }
    );
    if(code != 0) return Alert({ text: message });
    redraw_grid_values(target.querySelector('tbody'), { rows: Data.Data, columns: Data.Columns });
}

const change_table_order = (event, grid_obj) => {
    const clicked_th = event.target.closest('th');
    const ths = Array.from(event.target.closest('tr').querySelectorAll('th'));
    grid_obj.ReOrder(ths.indexOf(clicked_th));
};

const create_grid_header = (grid_obj, columns) => {
    // Handle order event
    const thead = document.createElement('thead');
    const tr = document.createElement('tr');
    columns.map(column => {
        const th = document.createElement('th');
        th.append(document.createTextNode(column.Name));
        if(column.order !== undefined) {
            const sort_icon = document.createElement('i');
            sort_icon.classList.add('fa-solid', `fa-${column.order === 0 ? 'sort-up' : 'sort-down'}`);
            th.append(sort_icon);
        }
        th.classList.add('pointer');

        th.addEventListener('click', e => change_table_order(e, grid_obj));

        tr.append(th);
    });
    thead.append(tr);
    return thead;
};

const redraw_grid_values = (tbody, {rows, columns, allow_html_rendering = false}) => {
    rows.map(row => {
        const tr = document.createElement('tr');
        row.forEach((column, j) => {
            const td = document.createElement('td');
            td.style.textAlign = columns[j].Type === 'string' ? 'right' : 'left';
            if(!allow_html_rendering) td.append(document.createTextNode(column));
            else td.innerHTML = column;
            tr.append(td);
        });
        tbody.append(tr);
    });
};

const create_grid_values = (columns, rows, {allow_html_rendering, create_tbody = true, table_id = null}) => {
    let tbody = null;

    if(create_tbody) tbody = document.createElement('tbody');
    if(!create_tbody) {
        if(table_id === null) {
            throw new Exception('table_id has not been provided to create_grid_values function');
        }
        tbody = document.getElementById(table_id).querySelector('tbody');
    }

    redraw_grid_values(tbody, { allow_html_rendering, rows, columns });

    return tbody;
};

export const create_grid = options => {
    return new Grid(options);
};