import React, { useState } from "react";


import { animated, useSpring } from "react-spring";

import styled, { ThemeProvider } from "styled-components";

import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';

import Divider from '@material-ui/core/Divider';

import Typography from '@material-ui/core/Typography';



const AnimatedBox = styled(animated(Divider))`
  cursor: pointer;
`;
AnimatedBox.defaultProps = {};
const ProgressBar = styled(Box)``;
ProgressBar.defaultProps = {
  height: 18,
  width: "100%",
  border: 1
};

export default function ProgressBtn() {
  const [clicked, setClicked] = useState(false);

  const {
    size,
    counter,
    progress,
    counterFontColor,
    ...springProps
  } = useSpring({
    progress: clicked ? "100%" : "0%",
    size: clicked ? 50 : 55,
    counter: clicked ? 100 : 0,
    counterFontColor: clicked ? "#fff" : "#000",
    backgroundPosition: clicked ? "50% 100%" : "50% 0%",
    from: {
      progress: "0%",
      size: 200,
      counter: 0,
      counterFontColor: "#000",
      backgroundPosition: "50% 0%"
    }
  });

  return (
    <ThemeProvider color="#000">
      <Box bg="bg100" minHeight="100vh" py={1}>
        <Container>

          <Typography textAlign="center">
            Click on the box to trigger animation
          </Typography>
          <Divider my={2} justifyContent="center">
            <ProgressBar>
              <AnimatedBox
                // bg={color}
                height="100%"
                style={{ width: progress }}
              />
            </ProgressBar>
            <AnimatedBox
              onClick={() => setClicked(true)}
              position="absolute"
              fontSize={0}
              style={{ color: counterFontColor }}
            >
              {counter.interpolate(val => Math.floor(val) + "%")}
            </AnimatedBox>
          </Divider>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

