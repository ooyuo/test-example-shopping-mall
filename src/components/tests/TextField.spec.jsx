import { screen, fireEvent } from '@testing-library/react';
import React from 'react';

import TextField from '@/components/TextField';
import render from '@/utils/test/render';

describe('TextField', () => {
  // Setup & Teardown
  const setup = async (props = {}) => {
    const renderResult = await render(<TextField {...props} />);
    const textInput = screen.getByPlaceholderText(
      props.placeholder || '텍스트를 입력해 주세요.',
    );
    return {
      textInput,
      ...renderResult,
    };
  };

  const teardown = () => {
    vi.clearAllMocks();
  };

  afterEach(() => {
    teardown();
  });

  describe('스타일', () => {
    it('className prop으로 설정한 css class가 적용된다', async () => {
      const { textInput } = await setup({ className: 'my-class' });
      expect(textInput).toHaveClass('my-class');
    });

    it('포커스가 활성화되면 border 스타일이 추가된다', async () => {
      const { textInput, user } = await setup();
      await user.click(textInput);

      expect(textInput).toHaveStyle({
        borderWidth: '2px',
        borderColor: 'rgb(25, 118, 210)',
      });
    });

    it('포커스가 해제되면 border 스타일이 제거된다', async () => {
      const { textInput, user } = await setup();
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
      const { textInput } = await setup();
      expect(textInput).toBeInTheDocument();
    });

    it('placeholder prop에 따라 placeholder가 변경된다', async () => {
      const customPlaceholder = '상품명을 입력해 주세요.';
      const { textInput } = await setup({ placeholder: customPlaceholder });
      expect(textInput).toHaveAttribute('placeholder', customPlaceholder);
    });
  });

  describe('이벤트 핸들링', () => {
    it('텍스트를 입력하면 onChange prop으로 등록한 함수가 호출된다', async () => {
      const handleChange = vi.fn();
      const { textInput } = await setup({ onChange: handleChange });

      fireEvent.change(textInput, { target: { value: 'test' } });

      expect(handleChange).toHaveBeenCalledWith('test');
    });

    it('엔터키를 입력하면 onEnter prop으로 등록한 함수가 호출된다', async () => {
      const handleEnter = vi.fn();
      const { textInput } = await setup({ onEnter: handleEnter });

      // fireEvent를 사용하여 더 명확한 이벤트 시뮬레이션
      fireEvent.change(textInput, { target: { value: 'test' } });
      fireEvent.keyDown(textInput, {
        key: 'Enter',
        code: 'Enter',
        charCode: 13,
      });

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
      const { textInput } = await setup({ onEnter: handleEnter });

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
      const { textInput } = await setup({ onEnter: handleEnter });

      fireEvent.change(textInput, { target: { value: 'test' } });
      fireEvent.keyDown(textInput, {
        key: 'Enter',
        code: 'Enter',
      });

      expect(handleEnter).toHaveBeenCalledTimes(1);
      expect(handleEnter).toHaveBeenCalledWith('test');
    });

    it('포커스가 활성화되면 onFocus prop으로 등록한 함수가 호출된다', async () => {
      const handleFocus = vi.fn();
      const { textInput } = await setup({ onFocus: handleFocus }); // 'onFocus'로 수정 (onfocus -> onFocus)

      fireEvent.focus(textInput);

      expect(handleFocus).toHaveBeenCalled();
    });

    it('value state가 올바르게 업데이트된다', async () => {
      const { textInput } = await setup();
      fireEvent.change(textInput, { target: { value: 'test' } });
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
