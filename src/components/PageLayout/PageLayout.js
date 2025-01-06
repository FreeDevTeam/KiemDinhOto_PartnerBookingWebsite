import React from 'react'
import * as sc from './PageLayout.styled'
export const PageLayout = (props) => {
  return (
    <sc.Container>
      <sc.Content overflow={props.overflowHidden ? 'hidden' : 'none'}>{props.children}</sc.Content>
    </sc.Container>
  )
}
