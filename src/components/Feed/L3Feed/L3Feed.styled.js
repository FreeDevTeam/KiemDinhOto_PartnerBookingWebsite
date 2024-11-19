import { smallScreenLimit } from './../../../constants/breakpoints'
import { blueSapphire } from './../../../constants/colors'
import styled from 'styled-components'

export const Content = styled.div`
  align-items: center;
  display:flex;
  justify-content: flex-start;
`
export const Image = styled.img`
  height: 80px;
  width: 80px;
  min-height: 50px;
  margin-right: 10px;

  @media (max-width: ${smallScreenLimit}) {
    min-width: unset;
    max-width: 60px;
    height:60px;
    width: 100%;
    flex: 1;
  }
`

export const Info = styled.div`
  flex: 1;
  width: 100%;
  max-width: 500px;
  min-width: 45%;
`

export const Title = styled.div`
  font-weight: 600;
  margin-bottom: 8px;
  text-decoration: none;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
`

export const CreatedAt = styled.div`
  color: rgba(117, 117, 117, 0.7);
`

export const Divider = styled.div`
  width: 100%;
  height: 0px;
  margin: 16px 0;

  border: 1px solid rgba(0, 0, 0, 0.08);

  ${(props) =>
    props.type === 'feed_vertical'
      ? `
      display: none;
    `
      : ''};
`

export const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 0px;

  width: 600px;

  flex: none;
  order: 0;
  flex-grow: 0;

  a {
    display: block;
    width: 100%;
    text-decoration: unset !important;
  }

  @media (min-width: ${smallScreenLimit}) {  
    ${(props) =>
      props.type === 'feed_vertical'
        ? `
      flex-flow: column;
      height: 100%;
      width: 316px;
    `
        : ''};
  }

  @media (max-width: ${smallScreenLimit}) {
    width: 100%;
  }
  @media (max-width: 650px) {
    height:100%;
  }

  @media (min-width: ${smallScreenLimit}) {
    ${Content} {
      flex-flow: ${(props) => (props.type === 'feed_vertical' ? 'column' : 'row')};
    }

    ${Info} {
      ${(props) =>
        props.type === 'feed_vertical'
          ? `
      width: 316px;
      max-width: 316px;

      margin-top: 14px;
    `
          : ''};
    }
    ${Title} {
      ${(props) =>
        props.type === 'feed_vertical'
          ? `
      font-size: 17px;
      line-height: 24px;
      -webkit-line-clamp: 2;
    `
          : ''};
    }
  }

  &:hover {
    ${Title} {
      color: ${blueSapphire};
    }
  }
`
export const Text = styled.div`
  font-style: normal;
  margin-bottom: 8px;
  text-decoration: none;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  h1,h2,h3,h4,h5,p,strong,p{
    font-size:14px;
    font-weight:300;
  }
`
