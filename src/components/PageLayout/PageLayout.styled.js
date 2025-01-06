import styled from 'styled-components'

export const Container = styled.div`
  width: 100%;

  display: flex;
  align-items: center;
  flex-flow: column;
`

export const Content = styled.div`
  width: 988px;
  max-width: 988px;

  overflow: ${(props) => props.overflow};

  @media (max-width: 994px) {
    width: 100%;
  }
`
