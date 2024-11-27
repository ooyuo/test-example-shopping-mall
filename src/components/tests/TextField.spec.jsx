import { screen, fireEvent } from '@testing-library/react';
import React from 'react';

import TextField from '@/components/TextField';
import render from '@/utils/test/render';

it('className prop으로 설정한 css class가 적용된다.', async () => {
  // AAA
  // Arrange -> Act -> Assert

  // #1. Arrange
  // render API 호출 -> 테스트 환경의 jsDOM에 리액트 컴포넌트가 랜더링된 DOM 구조가 반영
  // jsDOM: Node.js에서 사용하기 위해 많은 웹 표준을 순수 자바스크립트로 구현
  await render(<TextField className="my-class" />);

  // #2. Assert
  // vitest의 expect 함수를 사용하여 기대 결과를 검증

  // className이란 내부 prop이나 state 값을 검증 (X)
  // 랜더링되는 DOM 구조가 올바르게 변경되었는지 확인 (O) -> 최종적으로 사용자가 보는 결과는 DOM
  expect(screen.getByPlaceholderText('텍스트를 입력해 주세요.')).toHaveClass(
    'my-class',
  );
});

describe('TextField', () => {
  describe('스타일', () => {
    it('className prop으로 설정한 css class가 적용된다', async () => {
      await render(<TextField className="my-class" />);

      const textInput = screen.getByPlaceholderText('텍스트를 입력해 주세요.');

      expect(textInput).toHaveClass('my-class');
    });

    it('포커스가 활성화되면 border 스타일이 추가된다', async () => {
      const { user } = await render(<TextField />);

      const textInput = screen.getByPlaceholderText('텍스트를 입력해 주세요.');

      await user.click(textInput);

      expect(textInput).toHaveStyle({
        borderWidth: '2px',
        borderColor: 'rgb(25, 118, 210)',
      });
    });

    it('포커스가 해제되면 border 스타일이 제거된다', async () => {
      const { user } = await render(<TextField />);

      const textInput = screen.getByPlaceholderText('텍스트를 입력해 주세요.');

      await user.click(textInput);
      await user.tab();

      expect(textInput).not.toHaveStyle({
        borderWidth: '2px',
        borderColor: 'rgb(25, 118, 210)',
      });
    });
  });

  describe('placeholder', () => {
    it('기본 placeholder "텍스트를 입력해 주세요."가 노출된다', async () => {
      await render(<TextField />);

      const textInput = screen.getByPlaceholderText('텍스트를 입력해 주세요.');

      expect(textInput).toBeInTheDocument();
    });

    it('placeholder prop에 따라 placeholder가 변경된다', async () => {
      await render(<TextField placeholder="상품명을 입력해 주세요." />);

      const textInput = screen.getByPlaceholderText('상품명을 입력해 주세요.');

      expect(textInput).toBeInTheDocument();
    });
  });

  describe('이벤트 핸들링', () => {
    it('텍스트를 입력하면 onChange prop으로 등록한 함수가 호출된다', async () => {
      const handleChange = vi.fn();
      const { user } = await render(<TextField onChange={handleChange} />);

      const textInput = screen.getByPlaceholderText('텍스트를 입력해 주세요.');

      await user.type(textInput, 'test'); // 실제 사용자가 키보드로 입력하는 것을 시뮬레이션

      expect(handleChange).toHaveBeenCalledWith('test');
    });

    it('엔터키를 입력하면 onEnter prop으로 등록한 함수가 호출된다', async () => {
      const handleEnter = vi.fn();
      const { user } = await render(<TextField onChange={handleEnter} />);

      const textInput = screen.getByPlaceholderText('텍스트를 입력해 주세요.');

      await user.type(textInput, 'test{Enter}');

      expect(handleEnter).toHaveBeenCalledWith('test');
    });

    /**
     * IME 조합 중 엔터키 동작 테스트
     * IME로 텍스트를 입력하는 중에 엔터키를 눌렀을 때
     * onEnter 콜백이 호출되지 않아야 함을 검증합니다.
     *
     * @example
     * // 실제 사용 예시:
     * // 1. 한글 입력 시 "안녕"에서 "안"을 입력하는 중(ㅇ → 아 → 안)일 때는 조합 중인 상태
     * // 2. 이때 엔터키를 눌러도 onEnter가 호출되지 않아야 함
     */
    it('IME 조합 중인 엔터키는 무시된다', async () => {
      const handleEnter = vi.fn();
      render(<TextField onEnter={handleEnter} />);

      const textInput = screen.getByPlaceholderText('텍스트를 입력해 주세요.');

      // 텍스트 입력 시뮬레이션
      fireEvent.change(textInput, { target: { value: 'test' } });

      // IME 조합 시작 이벤트 발생
      fireEvent.compositionStart(textInput);

      // IME 조합 중 엔터키 이벤트 발생
      fireEvent.keyDown(textInput, {
        key: 'Enter',
        code: 'Enter',
        charCode: 13,
        keyCode: 13,
        isComposing: true,
      });

      // onEnter 콜백이 호출되지 않았는지 검증
      expect(handleEnter).not.toHaveBeenCalled();
    });

    it('일반 엔터키는 정상적으로 처리된다', async () => {
      const handleEnter = vi.fn();
      const { user } = await render(<TextField onEnter={handleEnter} />);

      const textInput = screen.getByPlaceholderText('텍스트를 입력해 주세요.');

      await user.type(textInput, 'test{Enter}');

      expect(handleEnter).toHaveBeenCalledTimes(1);
      expect(handleEnter).toHaveBeenCalledWith('test');
    });

    it('포커스가 활성화되면 onFocus prop으로 등록한 함수가 호출된다', async () => {
      const handleFocus = vi.fn();
      const { user } = await render(<TextField onFocus={handleFocus} />);

      const textInput = screen.getByPlaceholderText('텍스트를 입력해 주세요.');

      await user.click(textInput);

      expect(handleFocus).toHaveBeenCalled();
    });

    it('value state가 올바르게 업데이트된다', async () => {
      const { user } = await render(<TextField />);

      const textInput = screen.getByPlaceholderText('텍스트를 입력해 주세요.');

      await user.type(textInput, 'test');

      expect(textInput).toHaveValue('test');
    });
  });
});

/**
 * Testing Library user-event 키보드 입력 시뮬레이션
 *
 * user.type(element, '{키입력}') 형태로 사용
 *
 * 주요 특수키:
 * - {Enter}: 엔터키
 * - {Space}: 스페이스바
 * - {Backspace}: 백스페이스
 * - {Tab}: 탭키
 *
 * 예시:
 * user.type(element, 'hello{Backspace}{Enter}')
 * // 'hello' 입력 -> 백스페이스로 한 글자 삭제 -> 엔터키 입력
 */
