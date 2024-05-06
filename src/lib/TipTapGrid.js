import { Node } from '@tiptap/core';

const TipTapGrid = Node.create({
  name: 'TipTapGrid',

  addOptions() {
    return {
      numberOfColumns: 2, // Standardanzahl der Spalten
      gap: '10px', // Standardabstand zwischen den Spalten
    };
  },

  addAttributes() {
    return {
      numberOfColumns: {
        default: 2,
        rendered: false,
        parseHTML: element => element.style.gridTemplateColumns.split(' ').length,
      },
      gap: {
        default: '10px',
        rendered: false,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-grid]',
      },
    ];
  },

  renderHTML({ node }) {
    return ['div', {
      'data-grid': '',
      style: `display: grid; grid-template-columns: repeat(${node.attrs.numberOfColumns}, 1fr); gap: ${node.attrs.gap};`,
    }];
  },

  addCommands() {
    return {
      setGridDiv: options => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: options,
        });
      }
    };
  },
});

export default TipTapGrid;
