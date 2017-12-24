import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { findDOMNode } from 'react-dom'
import invariant from 'invariant'

import { provideDisplayName, omit } from '../utils'

let unselect = []
// Export Higher Order Sortable Element Component

export default function sortableElement(
  WrappedComponent,
  config = { withRef: false }
) {
  return class extends Component {
    state = {
      selected: false
    }
    static displayName = provideDisplayName('sortableElement', WrappedComponent)

    static contextTypes = {
      manager: PropTypes.object.isRequired
    }

    static propTypes = {
      index: PropTypes.number.isRequired,
      collection: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      disabled: PropTypes.bool
    }

    static defaultProps = {
      collection: 0
    }

    componentDidMount() {
      this.helperClass = this.context.manager.helperClass
      const { collection, disabled, index } = this.props

      if (!disabled) {
        this.setDraggable(collection, index)
      }
    }

    componentWillReceiveProps(nextProps) {
      if (this.props.index !== nextProps.index && this.node) {
        this.node.sortableInfo.index = nextProps.index
      }
      if (this.props.disabled !== nextProps.disabled) {
        const { collection, disabled, index } = nextProps

        if (disabled) {
          this.removeDraggable(collection)
        } else {
          this.setDraggable(collection, index)
        }
      } else if (
        this.props.collection !== nextProps.collection ||
        (nextProps.item && nextProps.item.selectedItems)
      ) {
        this.removeDraggable(this.props.collection)
        this.setDraggable(nextProps.collection, nextProps.index)
      }
      if (!nextProps.selected) {
        this.unselect()
      }
    }

    componentWillUnmount() {
      const { collection, disabled } = this.props

      unselect.splice(unselect.indexOf(this.unselect), 1)
      if (!disabled) {
        this.removeDraggable(collection)
      }
    }

    setDraggable(collection, index) {
      const node = (this.node = findDOMNode(this))

      node.sortableInfo = {
        index,
        collection,
        manager: this.context.manager
      }

      this.ref = { node }
      this.context.manager.add(collection, this.ref)
    }

    removeDraggable(collection) {
      this.context.manager.remove(collection, this.ref)
    }

    getWrappedInstance() {
      invariant(
        config.withRef,
        'To access the wrapped instance, you need to pass in {withRef: true} as the second argument of the SortableElement() call'
      )

      return this.refs.wrappedInstance
    }

    onSelect = e => {
      if (!(e.metaKey || e.ctrlKey)) {
        unselect.forEach(func => func())
        unselect = []
      }
      this.setState({
        selected: !this.state.selected
      })
      if (!this.state.selected) {
        this.context.manager.selected.push(this.node.sortableInfo.index)
        unselect.push(this.unselect)
      } else {
        const selected = this.context.manager.selected
        const index = selected.indexOf(this.node.sortableInfo)

        selected.splice(index, 1)
        unselect.splice(unselect.indexOf(this.unselect), 1)
      }
    }

    unselect = () => {
      this.setState({
        selected: false
      })
      const selected = this.context.manager.selected
      const index = selected.indexOf(this.node.sortableInfo)

      selected.splice(index, 1)
    }

    render() {
      const ref = config.withRef ? 'wrappedInstance' : null
      const props = {}
      const item = this.props.item

      if (item && item.selectedItems) {
        const items = item.selectedItems.map((value, index) => {
          return (
            <WrappedComponent
              key={index}
              item={value}
              className={this.helperClass}
            />
          )
        })

        return <div>{items}</div>
      }
      const component = (
        <WrappedComponent
          ref={ref}
          className={this.state.selected ? this.helperClass : ''}
          {...omit(this.props, 'collection', 'disabled', 'index')}
          onSelect={this.onSelect}
          {...props}
        />
      )

      if (this.context.manager.isMultiple) {
        return <div>{component}</div>
      }

      return component
    }
  }
}
