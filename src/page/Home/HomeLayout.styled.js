import { smallScreenLimit } from './../../constants/breakpoints'
import { tablet } from './../../constants/breakpoints'
import { blueSapphire } from './../../constants/colors'
import styled from 'styled-components'

export const Container = styled.div`
  min-height: calc(100vh - 405px);
  overflow: hidden;
`

export const Content = styled.div`
  padding: 20px 0px 80px 0px;

  display: flex;
  gap: 20px;

  @media (max-width: ${smallScreenLimit}) {
    padding: 25px 16px;
  }

  @media (max-width: ${tablet}) {
    flex-flow: column;
  }
`

export const Divider = styled.div`
  width: 100%;
  height: 2px;
  margin-bottom: 28px;
  margin-top: ${(props) => props.marginTop || 0}px;

  background: ${blueSapphire};
  border-radius: 12px 12px 0px 0px;
`

export const Left = styled.div`
  display: flex;
  flex-flow: column;
  flex: 1;
`
export const Right = styled.div``

export const TableNavContainer = styled.div`
  margin-top: 40px;

  @media (max-width: ${tablet}) {
    margin: 0 auto 20px auto;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`
