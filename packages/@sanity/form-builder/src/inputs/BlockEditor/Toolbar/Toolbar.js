// @flow
import type {
  BlockContentFeatures,
  SlateValue,
  SlateChange
} from '../typeDefs'

import React from 'react'

import AnnotationButtons from './AnnotationButtons'
import BlockStyle from './BlockStyle'
import Button from 'part:@sanity/components/buttons/default'
import CloseIcon from 'part:@sanity/base/close-icon'
import DecoratorButtons from './DecoratorButtons'
import FullscreenIcon from 'part:@sanity/base/fullscreen-icon'
import ListItemButtons from './ListItemButtons'


import styles from './styles/Toolbar.css'

type Props = {
  blockContentFeatures: BlockContentFeatures,
  editorValue: SlateValue,
  fullscreen: boolean,
  onChange: (change: SlateChange) => void,
  onToggleFullScreen: void => void
}

export default class Toolbar extends React.PureComponent<Props> {

  render() {
    const {
      blockContentFeatures,
      fullscreen,
      editorValue,
      onChange,
      onToggleFullScreen
    } = this.props
    const className = `${styles.root}${fullscreen ? ` ${styles.fullscreen}` : ''}`

    return (
      <div className={className}>

        <div className={styles.blockFormatContainer}>
          <BlockStyle
            editorValue={editorValue}
            onChange={onChange}
            blockContentFeatures={blockContentFeatures}
          />
        </div>

        <div className={styles.canBeMinimized}>

          <div className={styles.formatButtonsContainer}>

            <div className={styles.decoratorButtonsContainer}>
              <DecoratorButtons
                editorValue={editorValue}
                onChange={onChange}
                blockContentFeatures={blockContentFeatures}
              />
            </div>

            { blockContentFeatures.lists.length > 0 && (
              <div className={styles.decoratorButtonsContainer}>
                <ListItemButtons
                  editorValue={editorValue}
                  onChange={onChange}
                  blockContentFeatures={blockContentFeatures}
                />
              </div>
            )}

          </div>

          <div className={styles.annotationButtonsContainer}>
            <AnnotationButtons
              editorValue={editorValue}
              onChange={onChange}
              blockContentFeatures={blockContentFeatures}
            />
          </div>

        </div>

        <div className={styles.fullscreenButtonContainer}>
          <Button
            kind="simple"
            onClick={onToggleFullScreen}
            icon={fullscreen ? CloseIcon : FullscreenIcon}
          />
        </div>

      </div>
    )
  }
}
