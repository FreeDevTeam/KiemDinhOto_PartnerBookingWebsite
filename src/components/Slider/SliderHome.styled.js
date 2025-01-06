import { smallScreenLimit } from 'constants/breakpoints'
import { blueSapphire } from 'constants/colors'
import { white } from 'constants/colors'
import styled from 'styled-components'

export const Container = styled.div`
  position: relative;
  width: 988px;
  height: 514px;

  @media (max-width: ${smallScreenLimit}) {
    width: 100vw;
    margin: 0 auto;
    height: 225px;
  }
`

export const Overlay = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  z-index: 1;

  width: 988px;
  height: 514px;

  background: linear-gradient(0deg, rgba(34, 34, 34, 0.75) 2.92%, rgba(34, 34, 34, 0) 45.14%);

  pointer-events: none;

  @media (max-width: ${smallScreenLimit}) {
    width: calc(110vw - 32px);
    height: 225px;
  }
`

export const Thumbnail = styled.div`
  width: 100%;
  height: 100%;
  aspect-ratio: 1976/1165;
  /* Đảm bảo tỷ lệ 1.69 */
  position: relative;

  background: url(${(props) => props.bg}) center center no-repeat;
  background-size: cover;

  width: 988px;
  max-width: 988px;
  min-width: 988px;

  a {
    text-decoration: unset !important;
  }

  @media (max-width: ${smallScreenLimit}) {
  }
`

export const Dot = styled.div`
  position: absolute;
  left: 40px;
  z-index: 1;

  bottom: 45px;
  border-radius: 0px;
  height: 0;
  background: #ffffff25;

  display: flex;
  gap: 12px;
`

export const Title = styled.div`
  position: absolute;
  left: 40px;
  bottom: 67px;
  z-index: 10;

  max-width: 652px;

  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
  color: ${white};
  @media (max-width: ${smallScreenLimit}) {
    bottom: 40px;
  }

  > a {
    font-family: 'Open Sans';
    font-style: normal;
    font-weight: 700;
    font-size: 32px;
    line-height: 44px;
    color: ${white};

    &:hover {
      box-shadow: 0px 2px 0px rgba(0, 0, 0, 0.043);
    }
    @media (max-width: ${smallScreenLimit}) {
      font-size: 20px;
      line-height: 30px;
    }
  }
`
