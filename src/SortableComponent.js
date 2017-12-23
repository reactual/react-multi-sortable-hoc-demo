import React, { Component } from 'react'
import './SortableComponent.css'
import {
  sortableContainer,
  sortableElement,
  arrayMove,
  DragLayer
} from './react-sortable-multiple-hoc'

const dragLayer = new DragLayer()



const SortableItem = sortableElement((props) => {
  return (
    <div
      onClick={props.onSelect}
      className={props.className}
      style={{
        padding: '.35em',
      }}
    >
      <span
        style={{
          display: 'inline-block',
          marginRight: '10px'
        }}
      >
        {props.item.ind}
      </span>
        {props.item.val}
    </div>
  )
})





const SortableListItems = sortableContainer(({ items }) =>
    <div>
        {items.map((value, index) => (
          <SortableItem
              key={index}
              index={index}
              item={value}
          />
        ))}
    </div>
);


/**  This is the Chapter Part/Section Title, it drags as a group of items  */
const SortablePart = sortableElement(props => {
  // console.log('SortablePart - props', props)
  return (
    <div className="sortable-part1" style={{
      minWidth: '160px',
      minHeight: '270px',
      background: '#f2f2f2',
      margin: '10px',
      padding: '5px'
    }}>
      <div><span style={{ background: '#cc8', display: 'block', padding: '.35em'}}>{props.item.name}</span></div>
      <SortableListItems
        {...props}
        items={props.item.items}
        dragLayer={dragLayer}
        distance={3}
        helperClass={'selected'}
        isMultiple={true}
        helperCollision={{ top: 0, bottom: 0 }}
      />
    </div>
  )
})







/** Main Container on page */
const SortableListParts = sortableContainer(({ items, onSortItemsEnd }) =>
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      flexWrap:'wrap',
      justifyContent: 'space-around',
      background: 'lightblue',
      color: '#000',
      padding: '2em',
      // height: '800px',
      // overflow: 'auto',
    }}>
    {/* <div style={{
      display: 'flex',
      flexDirection: 'column',
      background: '#e0e0e0',
      color: '#000',
      padding: '2em',
      // height: '800px',
      // overflow: 'auto',
    }}> */}
        {items.map((value, index) => (
            <SortablePart
                key={index}
                index={index}
                item={value}
                id={index}
                onMultipleSortEnd={onSortItemsEnd}
            />
        ))}
    </div>
)








const getParts = (countParts, countLessons) => {
    const parts = [];

    for (let i = 0; i < countParts; i++) {
        const lessons = [];

        for (let j = 0; j < countLessons; j++) {
            lessons.push('Lesson-' + (i + 1) + '-' + (j + 1));
        }
        parts.push({
            name: 'Chapter Part',
            items: lessons,
        });
    }

    return parts;
};

export default class SortableComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            parts: getParts(20, 5),
        };
    }
    onSortEnd = ({ oldIndex, newIndex }) => {
        this.setState({
            parts: arrayMove(this.state.parts, oldIndex, newIndex),
        });
    }
    onSortItemsEnd = ({ newListIndex, newIndex, items }) => {
        const parts = this.state.parts.slice();
        const itemsValue = [];

        items.forEach(item => {
            itemsValue.push(parts[item.listId].items[item.id]);
        });
        for (let i = items.length - 1; i >= 0; i--) {
            const item = items[i];

            parts[item.listId].items.splice(item.id, 1);
        }
        parts[newListIndex].items.splice(newIndex, 0, ...itemsValue);
        this.setState({
            parts: parts,
        });
    }
    render() {
        const parts = this.state.parts.map((value, index) => {
            return {
                name: value.name,
                items: value.items.map((val, ind) => {
                    return {
                        val,
                        ind: (index + 1) + '.' + (ind + 1),
                    };
                }),
            };
        });

        return (<div>
        <SortableListParts
            items={parts}
            onSortEnd={this.onSortEnd}
            onSortItemsEnd={this.onSortItemsEnd}
            helperClass={'selected'}/>
    </div>);
    }
}
